import { Hono } from "hono";
import { logger } from "hono/middleware";
import runRoute from "./routes/run.ts";
import scenarioRoutes from "./routes/scenarios.ts";

const app = new Hono();

app.use("*", logger());

// Health check — useful to confirm the server is live after deploy
app.get("/health", (c) => c.json({ status: "ok", server: "mock-mcp-server" }));

// Main routes
app.route("/", runRoute);
app.route("/", scenarioRoutes);

// Catch-all for unknown paths
app.notFound((c) =>
  c.json({ error: "not_found", detail: `No route for ${c.req.method} ${c.req.path}` }, 404)
);

Deno.serve({ port: 8000 }, app.fetch);
