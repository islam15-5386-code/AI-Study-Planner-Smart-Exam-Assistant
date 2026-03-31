import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    opts: [{ type: String, required: true }],
    ans: { type: Number, required: true },
    exp: { type: String, default: "" }
  },
  { _id: false }
);

const quizSessionSchema = new mongoose.Schema(
  {
    topic: { type: String, default: "" },
    source: { type: String, enum: ["online", "fallback"], default: "fallback" },
    questions: [quizQuestionSchema]
  },
  { timestamps: true }
);

export default mongoose.model("QuizSession", quizSessionSchema);
