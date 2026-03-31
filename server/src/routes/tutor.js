import express from "express";
import { tutorReply } from "../services/ai.js";
import TutorMessage from "../models/TutorMessage.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const message = req.body?.message || "";

  const result = await tutorReply(message);
  const reply = result?.reply || "I could not generate a response right now.";
  const source = result?.source || "fallback";

  await TutorMessage.create({
    message,
    reply,
    source
  });

  return res.json({ source, reply });
});

router.get("/history", async (_req, res) => {
  const messages = await TutorMessage.find().sort({ createdAt: -1 }).limit(30);
  return res.json({ messages });
});

export default router;
