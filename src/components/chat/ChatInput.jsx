import { useRef, useState } from "react";
import { SendIcon } from "../common/icons.jsx";
import "./ChatInput.css";

/**
 * Message composer. Enter sends, Shift+Enter inserts a newline. While a
 * response is generating, the send button becomes a Stop button.
 */
function ChatInput({ onSend, onStop, isGenerating, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (event) => {
    setValue(event.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (event) => {
    const isModEnter = (event.metaKey || event.ctrlKey) && event.key === "Enter";
    const isPlainEnter = event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey;
    if (isModEnter || isPlainEnter) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-input">
      <div className="chat-input__box">
        <textarea
          id="chat-message-input"
          ref={textareaRef}
          className="chat-input__textarea"
          placeholder={disabled ? "Start a new conversation to begin chatting" : "Ask anything..."}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Message"
        />

        {isGenerating ? (
          <button type="button" className="chat-input__stop" onClick={onStop} aria-label="Stop generating">
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="chat-input__send"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatInput;
