import { useState } from "react";
import { splitHighlight } from "../../utils/formatting.js";
import "./ConversationItem.css";

function ConversationItem({ conversation, isActive, query, onSelect, onRename, onDelete }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  const startRename = () => {
    setDraft(conversation.title);
    setIsRenaming(true);
  };

  const saveRename = () => {
    onRename(conversation.id, draft);
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <li role="listitem" className="conversation-item conversation-item--editing">
        <input
          className="conversation-item__rename-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveRename();
            if (e.key === "Escape") setIsRenaming(false);
          }}
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <button type="button" onClick={saveRename} aria-label="Save name">
          ✓
        </button>
        <button type="button" onClick={() => setIsRenaming(false)} aria-label="Cancel rename">
          ✕
        </button>
      </li>
    );
  }

  if (isConfirmingDelete) {
    return (
      <li role="listitem" className="conversation-item conversation-item--editing">
        <span className="conversation-item__confirm-label">Delete this chat?</span>
        <button
          type="button"
          className="conversation-item__confirm-danger"
          onClick={() => onDelete(conversation.id)}
        >
          Delete
        </button>
        <button type="button" onClick={() => setIsConfirmingDelete(false)}>
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li role="listitem" className={`conversation-item${isActive ? " conversation-item--active" : ""}`}>
      <button
        type="button"
        className="conversation-item__select"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="conversation-item__title">
          {splitHighlight(conversation.title, query ?? "").map((segment, i) =>
            segment.match ? <mark key={i}>{segment.text}</mark> : <span key={i}>{segment.text}</span>,
          )}
        </span>
      </button>
      <span className="conversation-item__actions">
        <button type="button" className="conversation-item__icon-button" onClick={startRename} aria-label="Rename conversation">
          ✎
        </button>
        <button
          type="button"
          className="conversation-item__icon-button"
          onClick={() => setIsConfirmingDelete(true)}
          aria-label="Delete conversation"
        >
          🗑
        </button>
      </span>
    </li>
  );
}

export default ConversationItem;
