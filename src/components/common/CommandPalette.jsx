import { useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import { useChat } from "../../hooks/useChat.js";
import { useConversations } from "../../hooks/useConversations.js";
import { useTheme } from "../../hooks/useTheme.js";
import { THEME_MODES } from "../../config/theme.js";
import { exportConversation } from "../../services/exportService.js";
import "./CommandPalette.css";

function CommandPalette({ open, onClose, onOpenSettings }) {
  const [query, setQuery] = useState("");
  const { activeConversation, clearConversationMessages } = useChat();
  const { createConversation } = useConversations();
  const { resolvedTheme, setMode } = useTheme();

  const commands = useMemo(
    () => [
      {
        id: "new-conversation",
        label: "New conversation",
        run: () => createConversation(),
      },
      {
        id: "toggle-theme",
        label: `Switch to ${resolvedTheme === THEME_MODES.DARK ? "light" : "dark"} theme`,
        run: () => setMode(resolvedTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK),
      },
      {
        id: "clear-conversation",
        label: "Clear this conversation",
        disabled: !activeConversation,
        run: () => activeConversation && clearConversationMessages(activeConversation.id),
      },
      {
        id: "change-model",
        label: "Change model / settings",
        run: () => onOpenSettings(),
      },
      {
        id: "focus-input",
        label: "Focus message input",
        run: () => document.getElementById("chat-message-input")?.focus(),
      },
      {
        id: "search-conversations",
        label: "Search conversations",
        run: () => document.getElementById("conversation-search-input")?.focus(),
      },
      {
        id: "export-conversation",
        label: "Export conversation",
        disabled: !activeConversation,
        run: () => activeConversation && exportConversation(activeConversation),
      },
    ],
    [activeConversation, clearConversationMessages, createConversation, onOpenSettings, resolvedTheme, setMode],
  );

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const runAndClose = (command) => {
    if (command.disabled) return;
    command.run?.();
    setQuery("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Commands">
      <div className="command-palette">
        <input
          type="text"
          className="command-palette__input"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered[0] && !filtered[0].disabled) {
              runAndClose(filtered[0]);
            }
          }}
          autoFocus
        />
        <ul className="command-palette__list" role="listbox">
          {filtered.length === 0 && <li className="command-palette__empty">No matching commands.</li>}
          {filtered.map((command) => (
            <li key={command.id}>
              <button
                type="button"
                className="command-palette__item"
                onClick={() => runAndClose(command)}
                disabled={command.disabled}
              >
                {command.label}
                {command.disabled && <span className="command-palette__soon">Coming soon</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default CommandPalette;
