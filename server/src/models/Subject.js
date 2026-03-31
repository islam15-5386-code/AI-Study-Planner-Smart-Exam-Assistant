import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    progress: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
