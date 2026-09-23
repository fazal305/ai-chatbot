// Vercel Edge Function: server-side proxy for OpenRouter chat completions.
//
// The frontend never talks to openrouter.ai directly and never sees the
// API key. This function reads OPENROUTER_API_KEY (NOT VITE_-prefixed, so
// it is never inlined into the client bundle), attaches it server-side,
// and streams the response straight back to the browser.

export const config = {
  runtime: "edge",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "Method not allowed" } }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: { message: "The server is missing its OpenRouter API key configuration." },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: { message: "Invalid JSON body." } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { model, messages, temperature, max_tokens, stream, usage } = payload ?? {};

  let upstream;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter-recommended attribution headers (optional).
        "HTTP-Referer": req.headers.get("origin") || "",
        "X-Title": "Ai Chat Bot",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: stream ?? true,
        temperature,
        ...(max_tokens ? { max_tokens } : {}),
        usage: usage ?? { include: true },
      }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: "Failed to reach OpenRouter.", detail: String(err) } }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  // Forward status, content-type, and the (possibly streamed) body verbatim
  // — the client's normalizeHttpError/SSE parsing logic is unchanged.
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
