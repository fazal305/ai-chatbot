import { useCallback, useRef } from "react";
import { useChat } from "./useChat.js";
import { streamChatCompletion, OpenRouterError } from "../services/openRouterService.js";
import appConfig from "../config/app.js";

function toApiMessages(conversation) {
  const trimmed = conversation.messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content?.trim())
    .slice(-appConfig.defaults.maxHistoryMessages);

  const history = trimmed.map((m) => ({ role: m.role, content: m.content }));

  if (conversation.systemPrompt?.trim()) {
    return [{ role: "system", content: conversation.systemPrompt }, ...history];
  }
  return history;
}

function errorToMessage(err) {
  if (err instanceof OpenRouterError) return err.message;
  return "Something went wrong. Please try again.";
}

/**
 * Orchestrates a streaming request: builds the API message list from
 * conversation state, streams tokens into the assistant message via
 * useChat's primitives, and manages cancellation with AbortController.
 *
 * activeConversation is read through a ref (kept current every render)
 * rather than closed over directly. Its object identity changes on every
 * dispatch — including every streamed token — so closing over it would
 * recreate sendMessage/regenerate/retry/editMessageAndRegenerate on every
 * token too. Since those functions are passed down as props to every
 * MessageBubble, that would defeat MessageBubble's React.memo and force
 * the whole message list to re-render on every chunk instead of just the
 * one bubble whose content actually changed. Reading via a ref keeps
 * these callbacks referentially stable across renders. The shared
 * abortControllerRef (from ChatContext) matters for the same reason in
 * reverse: multiple components call this hook independently (ChatWindow,
 * and App for the Escape-to-stop shortcut), and they must all cancel the
 * same in-flight request rather than each tracking their own.
 */
export function useStreamingResponse() {
  const {
    activeConversation,
    abortControllerRef,
    addUserMessage,
    addAssistantPlaceholder,
    appendToMessage,
    updateMessage,
    removeMessage,
    truncateAfterMessage,
    setGenerating,
    setError,
    clearError,
  } = useChat();

  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  const runCompletion = useCallback(
    async (conversation, apiMessages, assistantMessage) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setGenerating(true, assistantMessage.id);
      clearError();

      const startedAt = performance.now();

      try {
        const result = await streamChatCompletion({
          model: conversation.model,
          messages: apiMessages,
          temperature: appConfig.defaults.temperature,
          maxTokens: appConfig.defaults.maxTokens,
          signal: controller.signal,
          onDelta: (delta) => appendToMessage(conversation.id, assistantMessage.id, delta),
        });

        updateMessage(conversation.id, assistantMessage.id, {
          status: "complete",
          model: result.model,
          usage: result.usage,
          responseTimeMs: performance.now() - startedAt,
        });
      } catch (err) {
        if (err instanceof OpenRouterError && err.type === "aborted") {
          updateMessage(conversation.id, assistantMessage.id, { status: "cancelled" });
        } else {
          console.error("[useStreamingResponse]", err);
          const message = errorToMessage(err);
          updateMessage(conversation.id, assistantMessage.id, { status: "error", error: message });
          setError(message);
        }
      } finally {
        setGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [abortControllerRef, appendToMessage, updateMessage, setGenerating, clearError, setError],
  );

  /** Send a new user message in the active conversation. */
  const sendMessage = useCallback(
    (content) => {
      const trimmed = content.trim();
      const conversation = activeConversationRef.current;
      if (!conversation || !trimmed) return;

      addUserMessage(conversation.id, trimmed);
      const assistantMessage = addAssistantPlaceholder(conversation.id, { model: conversation.model });

      // conversation.messages hasn't picked up the message we just
      // dispatched yet (state updates aren't synchronous), so append it
      // to a local snapshot for building the API request.
      const apiMessages = toApiMessages({
        ...conversation,
        messages: [...conversation.messages, { role: "user", content: trimmed }],
      });

      runCompletion(conversation, apiMessages, assistantMessage);
    },
    [addUserMessage, addAssistantPlaceholder, runCompletion],
  );

  /** Abort the in-flight request, if any. */
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, [abortControllerRef]);

  /** Discard the last assistant response and generate a new one for the same prompt. */
  const regenerate = useCallback(() => {
    const conversation = activeConversationRef.current;
    if (!conversation) return;
    const { messages } = conversation;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const historyUpToAssistant = messages.slice(0, messages.indexOf(lastAssistant));

    removeMessage(conversation.id, lastAssistant.id);
    const assistantMessage = addAssistantPlaceholder(conversation.id, { model: conversation.model });

    const apiMessages = toApiMessages({ ...conversation, messages: historyUpToAssistant });
    runCompletion(conversation, apiMessages, assistantMessage);
  }, [removeMessage, addAssistantPlaceholder, runCompletion]);

  /** Retry the most recent request after it failed. */
  const retry = useCallback(() => {
    const conversation = activeConversationRef.current;
    if (!conversation) return;
    const { messages } = conversation;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || last.status !== "error") return;

    removeMessage(conversation.id, last.id);
    const assistantMessage = addAssistantPlaceholder(conversation.id, { model: conversation.model });

    const apiMessages = toApiMessages({ ...conversation, messages: messages.slice(0, -1) });
    runCompletion(conversation, apiMessages, assistantMessage);
  }, [removeMessage, addAssistantPlaceholder, runCompletion]);

  /** Edit a past user message, discard everything after it, and regenerate. */
  const editMessageAndRegenerate = useCallback(
    (messageId, newContent) => {
      const conversation = activeConversationRef.current;
      if (!conversation) return;
      const trimmed = newContent.trim();
      if (!trimmed) return;

      const idx = conversation.messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;

      updateMessage(conversation.id, messageId, { content: trimmed });
      truncateAfterMessage(conversation.id, messageId);

      const historyUpToEdited = conversation.messages
        .slice(0, idx + 1)
        .map((m) => (m.id === messageId ? { ...m, content: trimmed } : m));

      const assistantMessage = addAssistantPlaceholder(conversation.id, { model: conversation.model });

      const apiMessages = toApiMessages({ ...conversation, messages: historyUpToEdited });
      runCompletion(conversation, apiMessages, assistantMessage);
    },
    [updateMessage, truncateAfterMessage, addAssistantPlaceholder, runCompletion],
  );

  return { sendMessage, stopGeneration, regenerate, retry, editMessageAndRegenerate };
}

export default useStreamingResponse;
