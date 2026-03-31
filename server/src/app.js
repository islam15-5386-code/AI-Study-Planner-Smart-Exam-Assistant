import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import dashboardRoutes from "./routes/dashboard.js";
import plannerRoutes from "./routes/planner.js";
import tasksRoutes from "./routes/tasks.js";
import quizRoutes from "./routes/quiz.js";
import tutorRoutes from "./routes/tutor.js";
import analyticsRoutes from "./routes/analytics.js";
import profileRoutes from "./routes/profile.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*"
  })
);
app.use(express.json());

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get("/", (_req, res) => {
  if (existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }

  return res.status(200).send(`
    <html>
      <head><title>StudyAI Server</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>StudyAI backend is running.</h2>
        <p>Frontend dev server: <a href="http://localhost:5173">http://localhost:5173</a></p>
        <p>Health endpoint: <a href="/api/health">/api/health</a></p>
      </body>
    </html>
  `);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "StudyAI server is healthy" });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);

export default app;
