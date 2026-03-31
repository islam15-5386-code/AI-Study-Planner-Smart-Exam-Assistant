import mongoose from "mongoose";

const tutorMessageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    reply: { type: String, required: true },
    source: { type: String, enum: ["wikipedia", "duckduckgo", "fallback"], default: "fallback" }
  },
  { timestamps: true }
);

export default mongoose.model("TutorMessage", tutorMessageSchema);
