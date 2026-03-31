import express from "express";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const [subjects, tasks] = await Promise.all([Subject.find().sort({ name: 1 }), Task.find()]);

  const completed = tasks.filter((t) => t.done).length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const studyHours = 142;

  const heatmap = Array.from({ length: 90 }, (_, i) => ({
    dayOffset: 90 - i,
    value: Math.floor(Math.random() * 5)
  }));

  return res.json({
    summary: {
      totalStudyHours: studyHours,
      tasksCompletedPercent: completionRate,
      quizzesTaken: 34
    },
    heatmap,
    subjects
  });
});

export default router;
