/**
 * Theme configuration.
 * The actual color values live in src/index.css as CSS custom properties
 * (--color-*). This file only defines the JS-level contract: which modes
 * exist, the default, and where the preference is persisted.
 */

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const themeConfig = {
  modes: [THEME_MODES.LIGHT, THEME_MODES.DARK, THEME_MODES.SYSTEM],
  defaultMode: THEME_MODES.SYSTEM,
  storageKey: "ai-chat-bot:theme",
  // Attribute set on <html> so CSS can select [data-theme="dark"] etc.
  domAttribute: "data-theme",
  systemMediaQuery: "(prefers-color-scheme: dark)",
};

export default themeConfig;
