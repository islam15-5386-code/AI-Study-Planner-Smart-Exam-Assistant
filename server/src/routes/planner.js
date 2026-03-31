import express from "express";
import { generatePlan } from "../services/ai.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { subjects = [], hours = 4, examDate = "" } = req.body || {};
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "At least one subject is required" });
  }

  const plan = await generatePlan({ subjects, hours, examDate });
  return res.json({ plan });
});

export default router;
