import { useEffect } from "react";

function matchesCombo(event, combo) {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop();
  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");
  const hasMod = event.metaKey || event.ctrlKey;

  if (needsMod !== hasMod) return false;
  if (needsShift !== event.shiftKey) return false;
  return event.key.toLowerCase() === key;
}

/**
 * Registers global keyboard shortcuts for the lifetime of the component.
 * `shortcuts` is [{ combo: "mod+k", handler, preventDefault? }]. "mod"
 * matches Ctrl on Windows/Linux and Cmd on Mac. Typing in an input/
 * textarea/contenteditable is ignored so shortcuts don't fight normal
 * text entry (the chat composer handles its own Enter/Shift+Enter).
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      for (const { combo, handler, preventDefault = true, allowWhileTyping = false } of shortcuts) {
        if (isTyping && !allowWhileTyping) continue;
        if (matchesCombo(event, combo)) {
          if (preventDefault) event.preventDefault();
          handler(event);
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;
