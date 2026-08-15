import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat.js";
import { useConversations } from "../../hooks/useConversations.js";
import { models, defaultModelId, getModelById } from "../../config/models.js";
import "./ModelSelector.css";

/**
 * Switches the model for the active conversation. Switching mid-
 * conversation only changes which model future messages use — existing
 * messages and history are left exactly as they are, never discarded.
 */
function ModelSelector() {
  const { activeConversation } = useChat();
  const { setConversationModel } = useConversations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = getModelById(activeConversation?.model ?? defaultModelId) ?? models[0];

  return (
    <div className="model-selector" ref={containerRef}>
      <button
        type="button"
        className="app-header__model-button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={!activeConversation}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentModel?.name ?? "Select model"}
        <span aria-hidden="true">▾</span>
      </button>

      {isOpen && activeConversation && (
        <ul className="model-selector__menu" role="listbox">
          {models.map((model) => (
            <li key={model.id} role="option" aria-selected={model.id === activeConversation.model}>
              <button
                type="button"
                className={`model-selector__option${model.id === activeConversation.model ? " model-selector__option--active" : ""}`}
                onClick={() => {
                  setConversationModel(activeConversation.id, model.id);
                  setIsOpen(false);
                }}
              >
                <span className="model-selector__option-name">{model.name}</span>
                <span className="model-selector__option-meta">{model.provider}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ModelSelector;
