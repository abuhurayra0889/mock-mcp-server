import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";

const app = new Hono();

// Simulates a slow builder server that never responds in time.
// The proxy should hit its own timeout and log success = false.
app.post("/run/timeout", authMiddleware, async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 35_000));
  return c.json({ status: "ok", output: "You should never see this" });
});

// Simulates a builder server that crashes with an internal error.
// The proxy must not bubble up raw 500 details to CT clients.
app.post("/run/error", authMiddleware, (c) => {
  return c.json(
    { error: "internal_server_error", detail: "Builder agent crashed" },
    500
  );
});

// Simulates a builder server that always rejects the token.
// Use this by calling the proxy with a wrong/missing key so you can
// verify the proxy logs success = false and CT gets a clean error.
app.post("/run/bad-auth", (c) => {
  return c.json({ error: "unauthorized", detail: "Invalid API key" }, 401);
});

export default app;
