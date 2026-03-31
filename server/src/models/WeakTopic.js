import mongoose from "mongoose";

const weakTopicSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("WeakTopic", weakTopicSchema);
