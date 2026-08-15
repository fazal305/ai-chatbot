import { useMemo, useState } from "react";
import { useConversations } from "../../hooks/useConversations.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import ConversationList from "../conversations/ConversationList.jsx";
import ConversationSearch from "../conversations/ConversationSearch.jsx";
import "./Sidebar.css";

function matchesQuery(conversation, query) {
  const q = query.toLowerCase();
  if (conversation.title.toLowerCase().includes(q)) return true;
  return conversation.messages.some((m) => m.content.toLowerCase().includes(q));
}

/**
 * Conversation sidebar: new chat, search (title + message content),
 * select, rename, delete. On tablet/mobile this renders as an off-canvas
 * drawer (see AppShell.css) — `isOpen` toggles its `sidebar--open` class,
 * and `onNavigate` closes it after picking/creating a conversation so
 * the chat is immediately visible instead of staying hidden behind it.
 */
function Sidebar({ isOpen, onNavigate }) {
  const {
    conversations,
    activeConversationId,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
  } = useConversations();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const filteredConversations = useMemo(() => {
    if (!debouncedQuery.trim()) return conversations;
    return conversations.filter((c) => matchesQuery(c, debouncedQuery));
  }, [conversations, debouncedQuery]);

  return (
    <nav className={`sidebar${isOpen ? " sidebar--open" : ""}`} aria-label="Conversations">
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__new-chat"
          onClick={() => {
            createConversation();
            onNavigate?.();
          }}
        >
          <span aria-hidden="true">+</span> New Chat
        </button>

        <ConversationSearch value={query} onChange={setQuery} />
      </div>

      <div className="sidebar__list">
        <ConversationList
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          query={debouncedQuery}
          onSelect={(id) => {
            selectConversation(id);
            onNavigate?.();
          }}
          onRename={renameConversation}
          onDelete={deleteConversation}
        />
      </div>
    </nav>
  );
}

export default Sidebar;
