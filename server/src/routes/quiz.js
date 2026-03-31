import express from "express";
import { generateQuiz } from "../services/ai.js";
import QuizSession from "../models/QuizSession.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const topic = req.body?.topic || "";

  const { source, questions } = await generateQuiz(topic);
  await QuizSession.create({
    topic,
    source,
    questions
  });

  return res.json({ source, questions });
});

router.get("/history", async (_req, res) => {
  const sessions = await QuizSession.find().sort({ createdAt: -1 }).limit(20);
  return res.json({ sessions });
});

export default router;
