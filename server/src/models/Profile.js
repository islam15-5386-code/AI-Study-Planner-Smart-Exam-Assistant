import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Rahul Ahmed" },
    grade: { type: String, default: "Class 12 (HSC)" },
    dailyStudyGoal: { type: Number, default: 4, min: 1, max: 12 },
    examDate: { type: String, default: "2026-04-18" },
    streak: { type: Number, default: 12 }
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
