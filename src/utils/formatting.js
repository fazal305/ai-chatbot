const MAX_TITLE_LENGTH = 48;

/** Derive a reasonable conversation title from the first user message. */
export function deriveConversationTitle(content) {
  const collapsed = content.trim().replace(/\s+/g, " ");
  if (!collapsed) return "New Chat";
  if (collapsed.length <= MAX_TITLE_LENGTH) return collapsed;
  return `${collapsed.slice(0, MAX_TITLE_LENGTH).trimEnd()}…`;
}

export function formatTimestamp(ms) {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatRelativeDay(ms) {
  const date = new Date(ms);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfDate) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "long" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Split text into segments for highlighting search matches (no HTML injection). */
export function splitHighlight(text, query) {
  if (!query.trim()) return [{ text, match: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.filter(Boolean).map((part) => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}

export function formatDurationMs(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
