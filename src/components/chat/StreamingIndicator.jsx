import { useEffect, useState } from "react";
import "./StreamingIndicator.css";

/** How long to wait with no tokens before showing the "taking longer" hint. */
const SLOW_RESPONSE_DELAY_MS = 7000;

/** Shown inside an assistant message while waiting for the first token. */
function StreamingIndicator() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_RESPONSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="streaming-indicator-wrap">
      <span className="streaming-indicator" role="status" aria-live="polite">
        <span className="streaming-indicator__dot" />
        <span className="streaming-indicator__dot" />
        <span className="streaming-indicator__dot" />
        <span className="sr-only">Assistant is thinking</span>
      </span>
      {isSlow && (
        <span className="streaming-indicator__slow-note" role="status" aria-live="polite">
          Still waiting for a response...
        </span>
      )}
    </span>
  );
}

export default StreamingIndicator;
