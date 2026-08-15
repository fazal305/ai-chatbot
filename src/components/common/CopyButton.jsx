import { useClipboard } from "../../hooks/useClipboard.js";
import "./CopyButton.css";

function CopyButton({ text, label = "Copy", className = "" }) {
  const { copied, copy } = useClipboard();

  return (
    <button
      type="button"
      className={`copy-button ${className}`.trim()}
      onClick={() => copy(text)}
      disabled={!text}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export default CopyButton;
