import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, default: "General" },
    time: { type: String, default: "1h" },
    done: { type: Boolean, default: false },
    color: { type: String, default: "#7c5cfc" }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
