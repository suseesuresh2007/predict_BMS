import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { extractBearerToken, hasValidSupabaseSession } from "./dashboardAccess";
import { dashboardTemplate } from "./dashboardTemplate";
import { resolveSupabasePublicConfig } from "./supabaseConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.get("/api/auth/config", (_req, res) => {
    const config = resolveSupabasePublicConfig();
    if (!config) {
      res.status(503).json({ error: "Authentication configuration is unavailable." });
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res.json(config);
  });

  app.get("/api/dashboard", async (req, res) => {
    const config = resolveSupabasePublicConfig();
    const token = extractBearerToken(req.get("Authorization"));
    const authorized = await hasValidSupabaseSession(token, config);

    if (!authorized) {
      res.status(401).json({ error: "A valid Supabase session is required." });
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({ html: dashboardTemplate });
  });

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
