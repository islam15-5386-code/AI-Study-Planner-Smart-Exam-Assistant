import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const tasks = await Task.find().sort({ createdAt: 1 });
  res.json({ tasks });
});

router.post("/", async (req, res) => {
  const { title, subject = "General", time = "1h", color = "#7c5cfc" } = req.body || {};
  if (!title?.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }

  const task = await Task.create({
    title: title.trim(),
    subject,
    time,
    color,
    done: false
  });

  return res.status(201).json({ task });
});

router.patch("/:id/toggle", async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.done = !task.done;
  await task.save();
  return res.json({ task });
});

export default router;
