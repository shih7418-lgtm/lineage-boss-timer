import type { Express } from "express";
import { executePlatformCommand } from "./platformCommand";

export function registerPlatformWebhookRoutes(app: Express) {
  app.post("/api/platform/command", async (req, res) => {
    try {
      const token = process.env.PLATFORM_WEBHOOK_TOKEN;
      if (token && req.header("x-platform-token") !== token) {
        return res.status(401).json({ error: "unauthorized" });
      }
      const reply = await executePlatformCommand(req.body);
      res.json({ reply });
    } catch (error: any) {
      console.error("[PlatformWebhook] command error", error);
      res.status(400).json({ error: error?.message || "command failed" });
    }
  });
}
