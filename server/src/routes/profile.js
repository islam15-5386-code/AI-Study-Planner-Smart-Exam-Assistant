import express from "express";
import Profile from "../models/Profile.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const profile = await Profile.findOne();
  return res.json({ profile });
});

router.put("/", async (req, res) => {
  const data = req.body || {};
  let profile = await Profile.findOne();

  if (!profile) {
    profile = new Profile(data);
  } else {
    profile.name = data.name ?? profile.name;
    profile.grade = data.grade ?? profile.grade;
    profile.dailyStudyGoal = Number(data.dailyStudyGoal ?? profile.dailyStudyGoal);
    profile.examDate = data.examDate ?? profile.examDate;
    profile.streak = Number(data.streak ?? profile.streak);
  }

  await profile.save();
  return res.json({ profile });
});

export default router;
