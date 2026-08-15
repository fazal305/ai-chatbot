import appConfig from "../config/app.js";

const EXPORT_VERSION = 1;

export class ImportValidationError extends Error {}

function isValidMessage(m) {
  return (
    m &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function isValidConversation(c) {
  return (
    c &&
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    typeof c.model === "string" &&
    typeof c.createdAt === "number" &&
    typeof c.updatedAt === "number" &&
    Array.isArray(c.messages) &&
    c.messages.every(isValidMessage)
  );
}

function buildExportPayload(conversations) {
  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: appConfig.shortName,
    conversations,
  };
}

/** Trigger a browser download of a JSON file (no server round-trip). */
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportConversation(conversation) {
  const filename = `${conversation.title.replace(/[^\w\- ]+/g, "").trim() || "conversation"}.json`;
  downloadJson(filename, buildExportPayload([conversation]));
}

export function exportAllConversations(conversations) {
  downloadJson(`${appConfig.shortName}-export.json`, buildExportPayload(conversations));
}

/**
 * Parse and validate an imported JSON payload. Never trusts the file:
 * rejects malformed JSON, rejects anything that doesn't structurally
 * match a conversation, and regenerates every id so imported data can
 * never collide with (or overwrite) existing local conversations.
 */
export function parseImportedConversations(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new ImportValidationError("That file isn't valid JSON.");
  }

  const conversations = Array.isArray(data) ? data : data?.conversations;
  if (!Array.isArray(conversations) || conversations.length === 0) {
    throw new ImportValidationError("No conversations found in this file.");
  }

  const valid = conversations.filter(isValidConversation);
  if (valid.length === 0) {
    throw new ImportValidationError("This file doesn't match the expected conversation format.");
  }

  return valid.map((c) => ({
    ...c,
    id: crypto.randomUUID(),
    messages: c.messages.map((m) => ({ ...m, id: crypto.randomUUID() })),
  }));
}
