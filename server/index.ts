import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { extractBearerToken, hasValidSupabaseSession } from "./dashboardAccess";
import { dashboardTemplate } from "./dashboardTemplate";
import { resolveSupabasePublicConfig } from "./supabaseConfig";
import {
  evaluateTelemetry,
  hasValidTelemetryToken,
  resolveTelemetryDeviceToken,
  telemetryPayloadSchema,
} from "./telemetry";
import { createSupabaseTelemetryStore } from "./telemetryStore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const telemetryStore = createSupabaseTelemetryStore();
  const telemetryDeviceToken = resolveTelemetryDeviceToken();
  const defaultDeviceId =
    process.env.TELEMETRY_DEFAULT_DEVICE_ID?.trim() || "esp32-demo-01";

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.json({ limit: "16kb" }));

  app.get("/api/auth/config", (_req, res) => {
    const config = resolveSupabasePublicConfig();
    if (!config) {
      res
        .status(503)
        .json({ error: "Authentication configuration is unavailable." });
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

  app.post("/api/telemetry", async (req, res) => {
    if (
      !hasValidTelemetryToken(req.get("Authorization"), telemetryDeviceToken)
    ) {
      res
        .status(401)
        .json({ error: "A valid device bearer token is required." });
      return;
    }
    if (!telemetryStore) {
      res.status(503).json({ error: "Telemetry storage is unavailable." });
      return;
    }

    const parsed = telemetryPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid telemetry payload.",
          details: parsed.error.flatten(),
        });
      return;
    }

    try {
      const previous =
        (await telemetryStore.getHistory(parsed.data.device_id, 1))[0] || null;
      const evaluation = evaluateTelemetry(parsed.data, previous);
      const reading = await telemetryStore.insertReading(
        parsed.data,
        evaluation
      );
      res.status(201).json({ ok: true, reading });
    } catch (error) {
      console.error("Telemetry insert failed", error);
      res.status(500).json({ error: "Unable to store telemetry." });
    }
  });

  async function readTelemetry(
    req: express.Request,
    res: express.Response,
    history: boolean
  ) {
    const config = resolveSupabasePublicConfig();
    const token = extractBearerToken(req.get("Authorization"));
    if (!(await hasValidSupabaseSession(token, config))) {
      res.status(401).json({ error: "A valid Supabase session is required." });
      return;
    }
    if (!telemetryStore) {
      res.status(503).json({ error: "Telemetry storage is unavailable." });
      return;
    }

    const deviceId = String(req.query.device_id || defaultDeviceId).trim();
    if (!/^[A-Za-z0-9._:-]{1,80}$/.test(deviceId)) {
      res.status(400).json({ error: "Invalid device_id." });
      return;
    }

    try {
      const readings = history
        ? await telemetryStore.getHistory(
            deviceId,
            Math.min(100, Math.max(1, Number(req.query.limit) || 30))
          )
        : await telemetryStore.getLatest(deviceId);
      res.setHeader("Cache-Control", "no-store");
      res.json(
        history
          ? { device_id: deviceId, readings }
          : { device_id: deviceId, reading: readings }
      );
    } catch (error) {
      console.error("Telemetry read failed", error);
      res.status(500).json({ error: "Unable to read telemetry." });
    }
  }

  app.get(
    "/api/telemetry/latest",
    (req, res) => void readTelemetry(req, res, false)
  );
  app.get(
    "/api/telemetry/history",
    (req, res) => void readTelemetry(req, res, true)
  );

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
