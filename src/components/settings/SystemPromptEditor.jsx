import { useEffect, useState } from "react";
import "./SystemPromptEditor.css";

/**
 * A labeled textarea with its own Save button and dirty-tracking, so it
 * can be reused for both a conversation's system prompt and the global
 * default without either instance stepping on the other's state.
 */
function SystemPromptEditor({ label, description, value, onSave, placeholder }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const isDirty = draft !== value;

  return (
    <div className="system-prompt-editor">
      <label className="system-prompt-editor__label" htmlFor={`system-prompt-${label}`}>
        {label}
      </label>
      {description && <p className="system-prompt-editor__description">{description}</p>}
      <textarea
        id={`system-prompt-${label}`}
        className="system-prompt-editor__textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />
      <button
        type="button"
        className="system-prompt-editor__save"
        onClick={() => onSave(draft)}
        disabled={!isDirty}
      >
        Save
      </button>
    </div>
  );
}

export default SystemPromptEditor;
