import express from "express";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import WeakTopic from "../models/WeakTopic.js";
import Profile from "../models/Profile.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const [subjects, tasks, weakTopics, profile] = await Promise.all([
    Subject.find().sort({ name: 1 }),
    Task.find().sort({ createdAt: 1 }),
    WeakTopic.find().sort({ score: 1 }),
    Profile.findOne()
  ]);

  const doneCount = tasks.filter((t) => t.done).length;
  const avgQuiz = 78;

  return res.json({
    stats: {
      streak: profile?.streak || 0,
      tasksDone: doneCount,
      tasksTotal: tasks.length,
      quizAverage: avgQuiz,
      examDate: profile?.examDate || "2026-04-18"
    },
    subjects,
    weakTopics
  });
});

export default router;
