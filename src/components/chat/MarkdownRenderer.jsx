import ReactMarkdown from "react-markdown";
import { markdownRemarkPlugins, markdownRehypePlugins, sanitizeUrl } from "../../utils/markdown.js";
import CodeBlock from "./CodeBlock.jsx";
import "./MarkdownRenderer.css";

const components = {
  a: ({ href, ...props }) => <a {...props} href={sanitizeUrl(href)} target="_blank" rel="noopener noreferrer" />,
  code: CodeBlock,
  // The default <pre> wrapper is skipped — CodeBlock renders its own
  // <pre> inside a bordered block with a header, so keeping react-
  // markdown's wrapper too would nest two <pre> elements.
  pre: ({ children }) => children,
};

/**
 * Renders AI responses as sanitized Markdown. react-markdown produces
 * React elements directly (no dangerouslySetInnerHTML, no rehype-raw),
 * so raw HTML in model output is never executed — it's shown as text.
 * Link hrefs are additionally scheme-checked (see sanitizeUrl) since
 * react-markdown itself no longer filters `javascript:` URIs.
 */
function MarkdownRenderer({ content }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={markdownRemarkPlugins} rehypePlugins={markdownRehypePlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
