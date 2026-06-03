import type { Context, Next } from "hono";

const KEY_PREFIX = "sk-collabai-";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "unauthorized", detail: "Missing Bearer token" }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token.startsWith(KEY_PREFIX) || token.length <= KEY_PREFIX.length) {
    return c.json({ error: "unauthorized", detail: "Invalid token format" }, 401);
  }

  // If EXPECTED_KEY is set, validate against the real generated key
  const expectedKey = Deno.env.get("EXPECTED_KEY");
  if (expectedKey && token !== expectedKey) {
    return c.json({ error: "unauthorized", detail: "Token mismatch" }, 401);
  }

  // Attach token to context for use in routes if needed
  c.set("api_key", token);

  await next();
}
