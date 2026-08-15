import { useChat } from "../../hooks/useChat.js";
import { useConversations } from "../../hooks/useConversations.js";
import { useStreamingResponse } from "../../hooks/useStreamingResponse.js";
import MessageList from "./MessageList.jsx";
import ChatInput from "./ChatInput.jsx";
import "./ChatWindow.css";

function ChatWindow() {
  const { activeConversation, messages, isGenerating, error, clearError } = useChat();
  const { createConversation } = useConversations();
  const { sendMessage, stopGeneration, regenerate, retry, editMessageAndRegenerate } = useStreamingResponse();

  if (!activeConversation) {
    return (
      <div className="chat-window chat-window--empty">
        <div className="chat-window__welcome">
          <h1 className="chat-window__welcome-title">Start a conversation</h1>
          <p className="chat-window__welcome-subtitle">
            Create a new chat to begin talking with the AI.
          </p>
          <button type="button" className="chat-window__welcome-button" onClick={() => createConversation()}>
            + New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {error && (
        <div className="chat-window__error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={clearError} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="chat-window__empty-thread">
          <p>Send a message to start this conversation.</p>
        </div>
      ) : (
        <MessageList
          messages={messages}
          isGenerating={isGenerating}
          onRegenerate={regenerate}
          onRetry={retry}
          onEdit={editMessageAndRegenerate}
        />
      )}

      <ChatInput onSend={sendMessage} onStop={stopGeneration} isGenerating={isGenerating} disabled={false} />
    </div>
  );
}

export default ChatWindow;
