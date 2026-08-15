import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import "./MessageList.css";

/**
 * Renders the message thread and keeps the view pinned to the bottom as
 * new content streams in, unless the user has scrolled up to read
 * earlier messages.
 */
function MessageList({ messages, isGenerating, onRegenerate, onRetry, onEdit }) {
  const containerRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div
      className="message-list"
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={message.id === lastId}
          isGenerating={isGenerating}
          onRegenerate={onRegenerate}
          onRetry={onRetry}
          onEdit={onEdit}
        />
      ))}
      <div className="message-list__bottom-spacer" />
    </div>
  );
}

export default MessageList;
