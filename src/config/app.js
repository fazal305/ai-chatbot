/**
 * Central application configuration.
 * Change branding, defaults, and feature flags here — never scatter
 * these values across components.
 */

export const appConfig = {
  name: "Ai Chat Bot",
  shortName: "AiChatBot",
  description: "A production-quality AI chat workspace powered by OpenRouter.",

  api: {
    baseUrl: "https://openrouter.ai/api/v1",
    chatCompletionsPath: "/chat/completions",
    // OpenRouter-recommended attribution headers (optional but good practice).
    // Set these to your actual deployed URL/name if you deploy publicly.
    referer: typeof window !== "undefined" ? window.location.origin : "",
    title: "Ai Chat Bot",
  },

  defaults: {
    systemPrompt: "You are a helpful, concise AI assistant.",
    temperature: 0.7,
    // Kept low so a limited-credit API key isn't burned quickly — some
    // models default to a very high max output (e.g. 16384) if this is
    // left unset. Raise this if you have a larger budget.
    maxTokens: 300,
    // Only the most recent N messages (plus the system prompt) are sent
    // as context on each request — full-history resend gets expensive
    // fast as a conversation grows, and most turns don't need it.
    maxHistoryMessages: 10,
  },

  storage: {
    keyPrefix: "ai-chat-bot",
    conversationsKey: "ai-chat-bot:conversations",
    settingsKey: "ai-chat-bot:settings",
    schemaVersion: 1,
  },

  features: {
    commandPalette: true,
    exportImport: true,
    tokenUsageDisplay: true,
  },

  shortcuts: {
    commandPalette: "mod+k",
    stopGeneration: "escape",
    newConversation: "mod+shift+n",
  },
};

export default appConfig;
