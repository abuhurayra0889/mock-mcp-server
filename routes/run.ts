import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";

const app = new Hono();

// Agreed request body schema:
// {
//   "input": {
//     "user_message": string,
//     "context": object (optional, arbitrary metadata)
//   }
// }
//
// Proxy also forwards:
//   x-ct-org-id  — the Control Tower org making the call

app.post("/run", authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body || !body.input || typeof body.input.user_message !== "string") {
    return c.json(
      { error: "bad_request", detail: "input.user_message is required and must be a string" },
      400
    );
  }

  const ctOrgId = c.req.header("x-ct-org-id") ?? null;

  return c.json({
    status: "ok",
    agent: "mock-summarizer-v1",
    output: `Mock response for: "${body.input.user_message}"`,
    tokens_used: 55,
    echoed: {
      ct_org_id: ctOrgId,
      received_context: body.input.context ?? null,
    },
  });
});

export default app;
