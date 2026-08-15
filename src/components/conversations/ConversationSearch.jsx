function ConversationSearch({ value, onChange }) {
  return (
    <input
      id="conversation-search-input"
      type="search"
      className="sidebar__search"
      placeholder="Search conversations..."
      aria-label="Search conversations"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default ConversationSearch;
