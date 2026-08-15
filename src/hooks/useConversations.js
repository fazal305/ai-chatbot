import { useCallback, useContext, useMemo } from "react";
import { ChatContext } from "../context/chatContextValue.js";
import { ACTIONS as ChatActions } from "../context/chatReducer.js";

function createId() {
  return crypto.randomUUID();
}

/**
 * Conversation-list-level operations (create/select/rename/delete/clear/
 * import), used by the sidebar. Message-level operations live in useChat.
 */
export function useConversations() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useConversations must be used within a ChatProvider");
  }
  const { state, dispatch } = ctx;

  const conversations = useMemo(
    () => [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [state.conversations],
  );

  const createConversation = useCallback(
    ({ model, systemPrompt } = {}) => {
      const now = Date.now();
      const conversation = {
        id: createId(),
        title: "New Chat",
        createdAt: now,
        updatedAt: now,
        model: model ?? state.settings.selectedModel,
        systemPrompt: systemPrompt ?? state.settings.systemPrompt,
        messages: [],
      };
      dispatch({ type: ChatActions.CREATE_CONVERSATION, payload: conversation });
      return conversation;
    },
    [dispatch, state.settings.selectedModel, state.settings.systemPrompt],
  );

  const selectConversation = useCallback(
    (id) => {
      dispatch({ type: ChatActions.SET_ACTIVE_CONVERSATION, payload: { id } });
    },
    [dispatch],
  );

  const renameConversation = useCallback(
    (id, title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      dispatch({ type: ChatActions.RENAME_CONVERSATION, payload: { id, title: trimmed } });
    },
    [dispatch],
  );

  const deleteConversation = useCallback(
    (id) => {
      dispatch({ type: ChatActions.DELETE_CONVERSATION, payload: { id } });
    },
    [dispatch],
  );

  const clearAllConversations = useCallback(() => {
    dispatch({ type: ChatActions.CLEAR_ALL_CONVERSATIONS });
  }, [dispatch]);

  const importConversations = useCallback(
    (importedConversations) => {
      dispatch({ type: ChatActions.IMPORT_CONVERSATIONS, payload: { conversations: importedConversations } });
    },
    [dispatch],
  );

  const setConversationModel = useCallback(
    (id, model) => {
      dispatch({ type: ChatActions.SET_CONVERSATION_MODEL, payload: { id, model } });
    },
    [dispatch],
  );

  const setConversationSystemPrompt = useCallback(
    (id, systemPrompt) => {
      dispatch({ type: ChatActions.SET_CONVERSATION_SYSTEM_PROMPT, payload: { id, systemPrompt } });
    },
    [dispatch],
  );

  return {
    conversations,
    activeConversationId: state.activeConversationId,
    isHydrated: state.isHydrated,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    importConversations,
    setConversationModel,
    setConversationSystemPrompt,
  };
}

export default useConversations;
