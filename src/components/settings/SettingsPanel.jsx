import { useRef, useState } from "react";
import Modal from "../common/Modal.jsx";
import SystemPromptEditor from "./SystemPromptEditor.jsx";
import { useTheme } from "../../hooks/useTheme.js";
import { useChat } from "../../hooks/useChat.js";
import { useConversations } from "../../hooks/useConversations.js";
import { THEME_MODES } from "../../config/theme.js";
import { models } from "../../config/models.js";
import {
  exportConversation,
  exportAllConversations,
  parseImportedConversations,
  ImportValidationError,
} from "../../services/exportService.js";
import "./SettingsPanel.css";

const THEME_OPTIONS = [
  { value: THEME_MODES.LIGHT, label: "Light" },
  { value: THEME_MODES.DARK, label: "Dark" },
  { value: THEME_MODES.SYSTEM, label: "System" },
];

function SettingsPanel({ open, onClose }) {
  const { mode, setMode } = useTheme();
  const { activeConversation, settings, updateSettings } = useChat();
  const { conversations, setConversationModel, setConversationSystemPrompt, importConversations, clearAllConversations } =
    useConversations();

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseImportedConversations(text);
      importConversations(imported);
      setImportStatus({ type: "success", message: `Imported ${imported.length} conversation(s).` });
    } catch (err) {
      const message = err instanceof ImportValidationError ? err.message : "Failed to read that file.";
      setImportStatus({ type: "error", message });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="settings-panel">
        <section className="settings-panel__section">
          <h3 className="settings-panel__section-title">Theme</h3>
          <div className="settings-panel__theme-options" role="radiogroup" aria-label="Theme">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={mode === option.value}
                className={`settings-panel__theme-button${mode === option.value ? " settings-panel__theme-button--active" : ""}`}
                onClick={() => setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-panel__section">
          <h3 className="settings-panel__section-title">Default model</h3>
          <p className="settings-panel__section-hint">Used for conversations you create from now on.</p>
          <select
            className="settings-panel__select"
            value={settings.selectedModel}
            onChange={(e) => updateSettings({ selectedModel: e.target.value })}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} — {model.provider}
              </option>
            ))}
          </select>

          {activeConversation && (
            <>
              <p className="settings-panel__section-hint">
                This conversation is currently using{" "}
                <strong>{models.find((m) => m.id === activeConversation.model)?.name}</strong>.
              </p>
              <select
                className="settings-panel__select"
                value={activeConversation.model}
                onChange={(e) => setConversationModel(activeConversation.id, e.target.value)}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    Use {model.name} for this conversation
                  </option>
                ))}
              </select>
            </>
          )}
        </section>

        <section className="settings-panel__section">
          <h3 className="settings-panel__section-title">System instructions</h3>
          <SystemPromptEditor
            label="Default for new conversations"
            value={settings.systemPrompt}
            onSave={(value) => updateSettings({ systemPrompt: value })}
            placeholder="You are a helpful assistant..."
          />

          {activeConversation && (
            <SystemPromptEditor
              label="This conversation"
              description="Overrides the default above, just for this chat."
              value={activeConversation.systemPrompt}
              onSave={(value) => setConversationSystemPrompt(activeConversation.id, value)}
              placeholder="You are a helpful assistant..."
            />
          )}
        </section>

        <section className="settings-panel__section">
          <h3 className="settings-panel__section-title">Data</h3>
          <div className="settings-panel__data-actions">
            <button
              type="button"
              className="settings-panel__data-button"
              disabled={!activeConversation}
              onClick={() => exportConversation(activeConversation)}
            >
              Export this conversation
            </button>
            <button
              type="button"
              className="settings-panel__data-button"
              disabled={conversations.length === 0}
              onClick={() => exportAllConversations(conversations)}
            >
              Export all conversations
            </button>
            <button type="button" className="settings-panel__data-button" onClick={() => fileInputRef.current?.click()}>
              Import conversations
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="settings-panel__file-input"
              onChange={handleImportFile}
            />
          </div>
          {importStatus && (
            <p
              className={`settings-panel__import-status settings-panel__import-status--${importStatus.type}`}
              role="status"
            >
              {importStatus.message}
            </p>
          )}
        </section>

        <section className="settings-panel__section settings-panel__section--danger">
          <h3 className="settings-panel__section-title">Danger zone</h3>
          {isConfirmingClear ? (
            <div className="settings-panel__confirm">
              <span>Delete all conversations? This can't be undone.</span>
              <div className="settings-panel__confirm-actions">
                <button
                  type="button"
                  className="settings-panel__danger-button"
                  onClick={() => {
                    clearAllConversations();
                    setIsConfirmingClear(false);
                  }}
                >
                  Delete all
                </button>
                <button type="button" onClick={() => setIsConfirmingClear(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="settings-panel__danger-button"
              disabled={conversations.length === 0}
              onClick={() => setIsConfirmingClear(true)}
            >
              Clear all conversations
            </button>
          )}
        </section>
      </div>
    </Modal>
  );
}

export default SettingsPanel;
