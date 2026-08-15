import { useCallback, useContext, useMemo, useRef } from "react";
import { ChatContext } from "../context/chatContextValue.js";
import { ACTIONS as ChatActions } from "../context/chatReducer.js";
import { deriveConversationTitle } from "../utils/formatting.js";

function createId() {
  return crypto.randomUUID();
}

/**
 * Read/write access to the active conversation's messages and generation
 * state. This hook owns message CRUD; it does not call OpenRouter itself —
 * useStreamingResponse (Step 6) calls these primitives while a request is
 * in flight.
 */
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  const { state, dispatch, abortControllerRef } = ctx;

  const activeConversation = useMemo(
    () => state.conversations.find((c) => c.id === state.activeConversationId) ?? null,
    [state.conversations, state.activeConversationId],
  );

  const messages = activeConversation?.messages ?? [];

  // Read via a ref (kept current every render) instead of closing over
  // state.conversations directly, so addUserMessage's identity stays
  // stable across renders — state.conversations gets a new array
  // reference on every dispatch (including every streamed token), which
  // would otherwise recreate this callback constantly and defeat
  // React.memo on every MessageBubble that receives it downstream.
  const conversationsRef = useRef(state.conversations);
  conversationsRef.current = state.conversations;

  const addUserMessage = useCallback(
    (conversationId, content) => {
      const message = {
        id: createId(),
        role: "user",
        content,
        createdAt: Date.now(),
        status: "complete",
      };
      dispatch({ type: ChatActions.ADD_MESSAGE, payload: { conversationId, message } });

      const conversation = conversationsRef.current.find((c) => c.id === conversationId);
      if (conversation && conversation.messages.length === 0) {
        dispatch({
          type: ChatActions.RENAME_CONVERSATION,
          payload: { id: conversationId, title: deriveConversationTitle(content) },
        });
      }

      return message;
    },
    [dispatch],
  );

  const addAssistantPlaceholder = useCallback(
    (conversationId, { model } = {}) => {
      const message = {
        id: createId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        status: "streaming",
        model: model ?? null,
        usage: null,
        responseTimeMs: null,
        error: null,
      };
      dispatch({ type: ChatActions.ADD_MESSAGE, payload: { conversationId, message } });
      return message;
    },
    [dispatch],
  );

  const appendToMessage = useCallback(
    (conversationId, messageId, delta) => {
      dispatch({ type: ChatActions.APPEND_TO_MESSAGE, payload: { conversationId, messageId, delta } });
    },
    [dispatch],
  );

  const updateMessage = useCallback(
    (conversationId, messageId, patch) => {
      dispatch({ type: ChatActions.UPDATE_MESSAGE, payload: { conversationId, messageId, patch } });
    },
    [dispatch],
  );

  const removeMessage = useCallback(
    (conversationId, messageId) => {
      dispatch({ type: ChatActions.REMOVE_MESSAGE, payload: { conversationId, messageId } });
    },
    [dispatch],
  );

  const truncateAfterMessage = useCallback(
    (conversationId, messageId) => {
      dispatch({ type: ChatActions.TRUNCATE_AFTER_MESSAGE, payload: { conversationId, messageId } });
    },
    [dispatch],
  );

  const setGenerating = useCallback(
    (isGenerating, streamingMessageId = null) => {
      dispatch({ type: ChatActions.SET_GENERATING, payload: { isGenerating, streamingMessageId } });
    },
    [dispatch],
  );

  const setError = useCallback(
    (error) => {
      dispatch({ type: ChatActions.SET_ERROR, payload: { error } });
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch({ type: ChatActions.SET_ERROR, payload: { error: null } });
  }, [dispatch]);

  const updateSettings = useCallback(
    (patch) => {
      dispatch({ type: ChatActions.SET_SETTINGS, payload: patch });
    },
    [dispatch],
  );

  const clearConversationMessages = useCallback(
    (conversationId) => {
      dispatch({ type: ChatActions.CLEAR_CONVERSATION_MESSAGES, payload: { id: conversationId } });
    },
    [dispatch],
  );

  return {
    activeConversation,
    messages,
    isGenerating: state.isGenerating,
    streamingMessageId: state.streamingMessageId,
    error: state.error,
    settings: state.settings,
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
    updateSettings,
    clearConversationMessages,
  };
}

export default useChat;
