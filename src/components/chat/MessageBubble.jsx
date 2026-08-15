import { memo, useState } from "react";
import StreamingIndicator from "./StreamingIndicator.jsx";
import MessageActions from "./MessageActions.jsx";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import "./MessageBubble.css";

function MessageBubble({ message, isLast, isGenerating, onRegenerate, onRetry, onEdit }) {
  const isUser = message.role === "user";
  const isEmptyStreaming = message.status === "streaming" && !message.content;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const startEdit = () => {
    setDraft(message.content);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`message-bubble message-bubble--${message.role}`}
      role="article"
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <div className="message-bubble__header">
        <span className="message-bubble__role">{isUser ? "You" : "Assistant"}</span>
        {isUser && !isEditing && (
          <button type="button" className="message-bubble__edit-trigger" onClick={startEdit}>
            Edit
          </button>
        )}
      </div>

      <div className="message-bubble__content">
        {isEditing ? (
          <div className="message-bubble__edit">
            <textarea
              className="message-bubble__edit-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(8, Math.max(2, draft.split("\n").length))}
              autoFocus
            />
            <div className="message-bubble__edit-actions">
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="button" className="message-bubble__edit-save" onClick={saveEdit}>
                Save & Regenerate
              </button>
            </div>
          </div>
        ) : isEmptyStreaming ? (
          <StreamingIndicator />
        ) : isUser ? (
          <p className="message-bubble__text">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {message.status === "error" && (
          <p className="message-bubble__error" role="alert">
            {message.error || "This response failed."}
          </p>
        )}

        {message.status === "cancelled" && (
          <p className="message-bubble__note">Generation stopped.</p>
        )}
      </div>

      {!isUser && (message.status === "complete" || message.status === "error") && (
        <MessageActions
          content={message.content}
          status={message.status}
          isLast={isLast}
          isGenerating={isGenerating}
          onRegenerate={onRegenerate}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}

export default memo(MessageBubble);
