import appConfig from "../config/app.js";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * Normalized error shape for anything that can go wrong talking to
 * OpenRouter. `type` lets the UI decide how to react (e.g. show a
 * "cancelled" state instead of an error banner) without string-matching
 * messages. `message` is always safe to show to a user; raw provider
 * details are attached via `cause` for console/dev inspection only.
 */
export class OpenRouterError extends Error {
  constructor(message, { type = "unknown", status = null, cause } = {}) {
    super(message);
    this.name = "OpenRouterError";
    this.type = type;
    this.status = status;
    if (cause !== undefined) this.cause = cause;
  }
}

export function hasApiKey() {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

function buildHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    // OpenRouter-recommended attribution headers (optional).
    "HTTP-Referer": appConfig.api.referer,
    "X-Title": appConfig.api.title,
  };
}

function normalizeHttpError(status, body) {
  const serverMessage = body?.error?.message;

  if (status === 401 || status === 403) {
    return new OpenRouterError(
      serverMessage || "Your OpenRouter API key was rejected. Check that it's valid and has not expired.",
      { type: "auth", status, cause: body },
    );
  }
  if (status === 429) {
    return new OpenRouterError(
      serverMessage || "You've hit OpenRouter's rate limit. Wait a moment and try again.",
      { type: "rate_limit", status, cause: body },
    );
  }
  if (status === 404) {
    return new OpenRouterError(
      serverMessage || "The selected model is unavailable right now.",
      { type: "model_unavailable", status, cause: body },
    );
  }
  if (status >= 500) {
    return new OpenRouterError(
      serverMessage || "The AI provider is having issues. Please try again shortly.",
      { type: "server", status, cause: body },
    );
  }
  return new OpenRouterError(serverMessage || "The request was rejected.", {
    type: "invalid_request",
    status,
    cause: body,
  });
}

/**
 * Stream a chat completion from OpenRouter's OpenAI-compatible endpoint.
 *
 * @param {object} params
 * @param {string} params.model - OpenRouter model id.
 * @param {{role: string, content: string}[]} params.messages
 * @param {number} [params.temperature]
 * @param {number} [params.maxTokens]
 * @param {AbortSignal} [params.signal]
 * @param {(delta: string) => void} [params.onDelta] - called with each incremental text chunk.
 * @returns {Promise<{content: string, usage: object|null, model: string, finishReason: string|null}>}
 */
export async function streamChatCompletion({
  model,
  messages,
  temperature,
  maxTokens,
  signal,
  onDelta,
}) {
  if (!hasApiKey()) {
    throw new OpenRouterError(
      "No OpenRouter API key is configured. Add VITE_OPENROUTER_API_KEY to your .env file and restart the dev server.",
      { type: "config" },
    );
  }

  let response;
  try {
    response = await fetch(`${appConfig.api.baseUrl}${appConfig.api.chatCompletionsPath}`, {
      method: "POST",
      headers: buildHeaders(),
      signal,
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
        // Ask OpenRouter to include token usage on the final stream chunk.
        usage: { include: true },
      }),
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new OpenRouterError("Request cancelled.", { type: "aborted" });
    }
    throw new OpenRouterError("Network error — check your connection and try again.", {
      type: "network",
      cause: err,
    });
  }

  if (!response.ok || !response.body) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // Response wasn't JSON; fall back to the generic status-based message.
    }
    throw normalizeHttpError(response.status, body);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let usage = null;
  let finishReason = null;
  let responseModel = model;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch (err) {
          console.warn("[openRouterService] Skipping malformed stream chunk:", payload, err);
          continue;
        }

        if (parsed.error) {
          throw normalizeHttpError(parsed.error.code ?? 500, parsed);
        }

        const choice = parsed.choices?.[0];
        const delta = choice?.delta?.content;
        if (delta) {
          content += delta;
          onDelta?.(delta);
        }
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
        if (parsed.model) {
          responseModel = parsed.model;
        }
        if (parsed.usage) {
          usage = parsed.usage;
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError" || signal?.aborted) {
      throw new OpenRouterError("Request cancelled.", { type: "aborted" });
    }
    if (err instanceof OpenRouterError) throw err;
    throw new OpenRouterError("The response stream was interrupted.", {
      type: "stream_interrupted",
      cause: err,
    });
  }

  if (!content) {
    throw new OpenRouterError("The model returned an empty response.", { type: "empty_response" });
  }

  return { content, usage, model: responseModel, finishReason };
}

export default { streamChatCompletion, hasApiKey, OpenRouterError };
