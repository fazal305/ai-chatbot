import { useEffect, useReducer, useRef } from "react";
import { chatReducer, initialChatState, ACTIONS } from "./chatReducer.js";
import { ChatContext } from "./chatContextValue.js";
import * as storageService from "../services/storageService.js";

const PERSIST_DEBOUNCE_MS = 350;

/**
 * Owns all conversation/message/generation state via useReducer and keeps
 * it in sync with localStorage. Persistence is debounced so a fast stream
 * of token updates during streaming doesn't hit localStorage on every
 * chunk — only after updates settle briefly, plus once immediately on
 * structural changes like create/delete/rename.
 */
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const persistTimer = useRef(null);
  const previousConversationIds = useRef(new Set());
  // Shared across every useStreamingResponse() call site (e.g. ChatWindow
  // and App's Escape-to-stop shortcut) so they all abort the same
  // in-flight request instead of each tracking an independent, unrelated
  // AbortController.
  const abortControllerRef = useRef(null);

  // One-time hydration from localStorage on mount.
  useEffect(() => {
    const conversations = storageService.loadConversations();
    const settings = storageService.loadSettings();
    dispatch({ type: ACTIONS.HYDRATE, payload: { conversations, settings } });
  }, []);

  // Debounced persistence of conversation records whenever they change.
  useEffect(() => {
    if (!state.isHydrated) return;

    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }

    persistTimer.current = setTimeout(() => {
      const currentIds = new Set(state.conversations.map((c) => c.id));

      for (const conversation of state.conversations) {
        storageService.saveConversation(conversation);
      }

      for (const id of previousConversationIds.current) {
        if (!currentIds.has(id)) {
          storageService.deleteConversation(id);
        }
      }

      previousConversationIds.current = currentIds;
    }, PERSIST_DEBOUNCE_MS);

    return () => clearTimeout(persistTimer.current);
  }, [state.conversations, state.isHydrated]);

  // Settings persist immediately — they change rarely and are small.
  useEffect(() => {
    if (!state.isHydrated) return;
    storageService.saveSettings(state.settings);
  }, [state.settings, state.isHydrated]);

  return (
    <ChatContext.Provider value={{ state, dispatch, abortControllerRef }}>{children}</ChatContext.Provider>
  );
}
