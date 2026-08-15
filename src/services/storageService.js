import appConfig from "../config/app.js";

/**
 * localStorage abstraction. Nothing outside this module should call
 * localStorage directly — that keeps the storage layer swappable (e.g.
 * for an IndexedDB migration; see the note at the bottom of this file).
 *
 * Layout:
 *   {prefix}:index               -> string[] of conversation ids, most-recent-first
 *   {prefix}:conversation:{id}   -> full conversation record (metadata + messages)
 *   {prefix}:settings            -> global settings object
 */

const { keyPrefix, schemaVersion } = appConfig.storage;

const indexKey = () => `${keyPrefix}:index`;
const conversationKey = (id) => `${keyPrefix}:conversation:${id}`;
const settingsKey = () => `${keyPrefix}:settings`;

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`[storageService] Failed to read "${key}":`, err);
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storageService] Failed to write "${key}":`, err);
    return false;
  }
}

function readIndex() {
  const index = safeGet(indexKey());
  return Array.isArray(index) ? index : [];
}

function writeIndex(ids) {
  safeSet(indexKey(), ids);
}

/** Load every persisted conversation, most-recently-updated first. */
export function loadConversations() {
  const ids = readIndex();
  const conversations = [];

  for (const id of ids) {
    const conversation = safeGet(conversationKey(id));
    if (conversation && conversation.id === id) {
      conversations.push(conversation);
    }
  }

  return conversations;
}

/** Create or overwrite a conversation record and keep the index in sync. */
export function saveConversation(conversation) {
  if (!conversation?.id) return;

  safeSet(conversationKey(conversation.id), conversation);

  const ids = readIndex();
  if (!ids.includes(conversation.id)) {
    writeIndex([conversation.id, ...ids]);
  }
}

/** Shallow-merge a patch into an existing conversation record. */
export function updateConversation(id, patch) {
  const existing = safeGet(conversationKey(id));
  if (!existing) return;

  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  safeSet(conversationKey(id), updated);
  return updated;
}

export function deleteConversation(id) {
  try {
    localStorage.removeItem(conversationKey(id));
  } catch (err) {
    console.error(`[storageService] Failed to delete conversation "${id}":`, err);
  }
  writeIndex(readIndex().filter((existingId) => existingId !== id));
}

export function clearAllConversations() {
  for (const id of readIndex()) {
    try {
      localStorage.removeItem(conversationKey(id));
    } catch (err) {
      console.error(`[storageService] Failed to clear conversation "${id}":`, err);
    }
  }
  writeIndex([]);
}

export function loadSettings() {
  return safeGet(settingsKey()) ?? null;
}

export function saveSettings(settings) {
  safeSet(settingsKey(), settings);
}

export function getSchemaVersion() {
  return schemaVersion;
}

/**
 * IndexedDB migration note:
 * Each conversation is already stored as one independent record keyed by
 * id, and the index is just an ordered list of those keys. That maps
 * directly onto an IndexedDB object store (keyPath: "id") plus a
 * lightweight ordering index, so swapping the implementation later means
 * rewriting the functions in this file only — no caller changes.
 * We're staying on localStorage for now because conversation volumes in
 * a demo/portfolio app are small (localStorage's ~5-10MB limit is not a
 * real constraint here) and synchronous localStorage reads keep the
 * initial-load code simple, with no IndexedDB's async open/transaction
 * boilerplate for a benefit that wouldn't be felt at this scale.
 */
