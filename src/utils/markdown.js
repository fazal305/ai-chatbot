import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/**
 * Shared remark/rehype plugin config for every Markdown render in the
 * app, so MarkdownRenderer (and anything else that needs it) doesn't
 * duplicate this setup.
 */
export const markdownRemarkPlugins = [remarkGfm];
export const markdownRehypePlugins = [[rehypeHighlight, { detect: true, ignoreMissing: true }]];

const SAFE_URL_SCHEMES = /^(https?:|mailto:|tel:)/i;

/**
 * react-markdown (v9+) does not sanitize link URIs itself — a model
 * response containing `[text](javascript:alert(1))` would otherwise
 * render as a clickable, executable link, since React only escapes
 * string content, not dangerous URI schemes in `href`. Anything that
 * isn't an allowed scheme or a relative/hash path is neutralized.
 */
export function sanitizeUrl(href) {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith(".")) return trimmed;
  return SAFE_URL_SCHEMES.test(trimmed) ? trimmed : undefined;
}

/** Recursively collect plain text from React children (incl. highlighted code spans). */
export function extractPlainText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractPlainText).join("");
  if (node?.props?.children != null) return extractPlainText(node.props.children);
  return "";
}
