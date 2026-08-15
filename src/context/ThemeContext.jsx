import { useEffect, useState } from "react";
import themeConfig, { THEME_MODES } from "../config/theme.js";
import { ThemeContext } from "./themeContextValue.js";

function getSystemPrefersDark() {
  return window.matchMedia(themeConfig.systemMediaQuery).matches;
}

function resolveTheme(mode) {
  return mode === THEME_MODES.SYSTEM ? (getSystemPrefersDark() ? THEME_MODES.DARK : THEME_MODES.LIGHT) : mode;
}

function readStoredMode() {
  try {
    const stored = localStorage.getItem(themeConfig.storageKey);
    return themeConfig.modes.includes(stored) ? stored : themeConfig.defaultMode;
  } catch {
    return themeConfig.defaultMode;
  }
}

/**
 * Owns the theme mode (light/dark/system) and reflects it onto
 * `<html data-theme="...">`. When mode is "system" the attribute is
 * removed entirely so index.css's `prefers-color-scheme` fallback
 * applies — this mirrors exactly how the CSS tokens were authored.
 */
export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(mode));

  useEffect(() => {
    const root = document.documentElement;
    if (mode === THEME_MODES.SYSTEM) {
      root.removeAttribute(themeConfig.domAttribute);
    } else {
      root.setAttribute(themeConfig.domAttribute, mode);
    }
    setResolvedTheme(resolveTheme(mode));

    try {
      localStorage.setItem(themeConfig.storageKey, mode);
    } catch (err) {
      console.error("[ThemeContext] Failed to persist theme:", err);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== THEME_MODES.SYSTEM) return undefined;
    const mql = window.matchMedia(themeConfig.systemMediaQuery);
    const handleChange = () => setResolvedTheme(resolveTheme(THEME_MODES.SYSTEM));
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode: setModeState, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
