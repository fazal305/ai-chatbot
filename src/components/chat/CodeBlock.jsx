import { extractPlainText } from "../../utils/markdown.js";
import CopyButton from "../common/CopyButton.jsx";
import "./CodeBlock.css";

/**
 * Overrides react-markdown's `code` element. Fenced code blocks (which
 * get a `language-x` className from remark) render as a bordered block
 * with a language label and copy button; anything else is inline code.
 */
function CodeBlock({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");

  if (!match) {
    return (
      <code className="markdown-inline-code" {...props}>
        {children}
      </code>
    );
  }

  const codeText = extractPlainText(children).replace(/\n$/, "");

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{match[1]}</span>
        <CopyButton text={codeText} />
      </div>
      <pre className="code-block__pre">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;
