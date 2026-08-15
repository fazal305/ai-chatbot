import { useCallback, useEffect, useRef, useState } from "react";

/** Copy text to the clipboard and expose a transient "copied" state for UI feedback. */
export function useClipboard({ timeout = 1500 } = {}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (err) {
        console.error("[useClipboard] Copy failed:", err);
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy };
}

export default useClipboard;
