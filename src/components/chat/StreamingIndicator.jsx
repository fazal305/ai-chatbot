import "./StreamingIndicator.css";

/** Shown inside an assistant message while waiting for the first token. */
function StreamingIndicator() {
  return (
    <span className="streaming-indicator" role="status" aria-live="polite">
      <span className="streaming-indicator__dot" />
      <span className="streaming-indicator__dot" />
      <span className="streaming-indicator__dot" />
      <span className="sr-only">Assistant is thinking</span>
    </span>
  );
}

export default StreamingIndicator;
