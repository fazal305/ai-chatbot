import ConversationItem from "./ConversationItem.jsx";

function ConversationList({ conversations, activeConversationId, query, onSelect, onRename, onDelete }) {
  if (conversations.length === 0) {
    return <p className="sidebar__empty">{query ? "No matching conversations." : "No conversations yet."}</p>;
  }

  return (
    <ul role="list" className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          query={query}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default ConversationList;
