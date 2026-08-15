import CopyButton from "../common/CopyButton.jsx";
import "./MessageActions.css";

/** Action row under an assistant message: Copy always; Regenerate or Retry when applicable. */
function MessageActions({ content, status, isLast, isGenerating, onRegenerate, onRetry }) {
  return (
    <div className="message-actions">
      <CopyButton text={content} />

      {status === "error" && isLast && (
        <button type="button" className="message-actions__button" onClick={onRetry} disabled={isGenerating}>
          Retry
        </button>
      )}

      {status === "complete" && isLast && (
        <button
          type="button"
          className="message-actions__button"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          Regenerate
        </button>
      )}
    </div>
  );
}

export default MessageActions;
