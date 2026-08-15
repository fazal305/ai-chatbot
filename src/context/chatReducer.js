import appConfig from "../config/app.js";
import { defaultModelId } from "../config/models.js";

export const ACTIONS = {
  HYDRATE: "HYDRATE",
  CREATE_CONVERSATION: "CREATE_CONVERSATION",
  DELETE_CONVERSATION: "DELETE_CONVERSATION",
  RENAME_CONVERSATION: "RENAME_CONVERSATION",
  SET_ACTIVE_CONVERSATION: "SET_ACTIVE_CONVERSATION",
  CLEAR_CONVERSATION_MESSAGES: "CLEAR_CONVERSATION_MESSAGES",
  CLEAR_ALL_CONVERSATIONS: "CLEAR_ALL_CONVERSATIONS",
  IMPORT_CONVERSATIONS: "IMPORT_CONVERSATIONS",
  ADD_MESSAGE: "ADD_MESSAGE",
  UPDATE_MESSAGE: "UPDATE_MESSAGE",
  APPEND_TO_MESSAGE: "APPEND_TO_MESSAGE",
  REMOVE_MESSAGE: "REMOVE_MESSAGE",
  TRUNCATE_AFTER_MESSAGE: "TRUNCATE_AFTER_MESSAGE",
  SET_GENERATING: "SET_GENERATING",
  SET_ERROR: "SET_ERROR",
  SET_CONVERSATION_MODEL: "SET_CONVERSATION_MODEL",
  SET_CONVERSATION_SYSTEM_PROMPT: "SET_CONVERSATION_SYSTEM_PROMPT",
  SET_SETTINGS: "SET_SETTINGS",
};

export const initialChatState = {
  isHydrated: false,
  conversations: [],
  activeConversationId: null,
  isGenerating: false,
  streamingMessageId: null,
  error: null,
  settings: {
    selectedModel: defaultModelId,
    systemPrompt: appConfig.defaults.systemPrompt,
  },
};

function touch(conversation) {
  return { ...conversation, updatedAt: Date.now() };
}

function mapConversation(state, id, updater) {
  return {
    ...state,
    conversations: state.conversations.map((conversation) =>
      conversation.id === id ? updater(conversation) : conversation,
    ),
  };
}

export function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE: {
      const { conversations, settings } = action.payload;
      return {
        ...state,
        isHydrated: true,
        conversations: conversations ?? [],
        settings: settings ? { ...state.settings, ...settings } : state.settings,
        activeConversationId: conversations?.[0]?.id ?? null,
      };
    }

    case ACTIONS.CREATE_CONVERSATION: {
      const conversation = action.payload;
      return {
        ...state,
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
        error: null,
      };
    }

    case ACTIONS.DELETE_CONVERSATION: {
      const { id } = action.payload;
      const remaining = state.conversations.filter((c) => c.id !== id);
      const wasActive = state.activeConversationId === id;
      return {
        ...state,
        conversations: remaining,
        activeConversationId: wasActive ? (remaining[0]?.id ?? null) : state.activeConversationId,
      };
    }

    case ACTIONS.RENAME_CONVERSATION: {
      const { id, title } = action.payload;
      return mapConversation(state, id, (c) => touch({ ...c, title }));
    }

    case ACTIONS.SET_ACTIVE_CONVERSATION: {
      return { ...state, activeConversationId: action.payload.id, error: null };
    }

    case ACTIONS.CLEAR_CONVERSATION_MESSAGES: {
      const { id } = action.payload;
      return mapConversation(state, id, (c) => touch({ ...c, messages: [] }));
    }

    case ACTIONS.CLEAR_ALL_CONVERSATIONS: {
      return { ...state, conversations: [], activeConversationId: null };
    }

    case ACTIONS.IMPORT_CONVERSATIONS: {
      const incoming = action.payload.conversations;
      const existingIds = new Set(state.conversations.map((c) => c.id));
      const deduped = incoming.filter((c) => !existingIds.has(c.id));
      return {
        ...state,
        conversations: [...deduped, ...state.conversations],
        activeConversationId: deduped[0]?.id ?? state.activeConversationId,
      };
    }

    case ACTIONS.ADD_MESSAGE: {
      const { conversationId, message } = action.payload;
      return mapConversation(state, conversationId, (c) =>
        touch({ ...c, messages: [...c.messages, message] }),
      );
    }

    case ACTIONS.UPDATE_MESSAGE: {
      const { conversationId, messageId, patch } = action.payload;
      return mapConversation(state, conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      }));
    }

    case ACTIONS.APPEND_TO_MESSAGE: {
      // Reads current content from state (not from a caller-held closure)
      // so rapid successive stream chunks never clobber each other.
      const { conversationId, messageId, delta } = action.payload;
      return mapConversation(state, conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === messageId ? { ...m, content: m.content + delta } : m,
        ),
      }));
    }

    case ACTIONS.REMOVE_MESSAGE: {
      const { conversationId, messageId } = action.payload;
      return mapConversation(state, conversationId, (c) => ({
        ...c,
        messages: c.messages.filter((m) => m.id !== messageId),
      }));
    }

    case ACTIONS.TRUNCATE_AFTER_MESSAGE: {
      // Keeps messages up to and including messageId, drops the rest —
      // used when an edited user message invalidates everything after it.
      const { conversationId, messageId } = action.payload;
      return mapConversation(state, conversationId, (c) => {
        const idx = c.messages.findIndex((m) => m.id === messageId);
        if (idx === -1) return c;
        return { ...c, messages: c.messages.slice(0, idx + 1) };
      });
    }

    case ACTIONS.SET_GENERATING: {
      const { isGenerating, streamingMessageId = null } = action.payload;
      return { ...state, isGenerating, streamingMessageId };
    }

    case ACTIONS.SET_ERROR: {
      return { ...state, error: action.payload.error, isGenerating: false, streamingMessageId: null };
    }

    case ACTIONS.SET_CONVERSATION_MODEL: {
      const { id, model } = action.payload;
      return mapConversation(state, id, (c) => touch({ ...c, model }));
    }

    case ACTIONS.SET_CONVERSATION_SYSTEM_PROMPT: {
      const { id, systemPrompt } = action.payload;
      return mapConversation(state, id, (c) => touch({ ...c, systemPrompt }));
    }

    case ACTIONS.SET_SETTINGS: {
      return { ...state, settings: { ...state.settings, ...action.payload } };
    }

    default:
      return state;
  }
}
