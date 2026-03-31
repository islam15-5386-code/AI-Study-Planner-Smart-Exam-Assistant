import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Subject from "./models/Subject.js";
import WeakTopic from "./models/WeakTopic.js";
import Task from "./models/Task.js";
import Profile from "./models/Profile.js";
import QuizSession from "./models/QuizSession.js";
import TutorMessage from "./models/TutorMessage.js";
import { defaultProfile, defaultSubjects, defaultTasks, defaultWeakTopics } from "./seed/defaults.js";

let memoryServer = null;
let connectedMode = null;

async function seedIfEmpty() {
  const [subjectCount, weakCount, taskCount, profileCount] = await Promise.all([
    Subject.countDocuments(),
    WeakTopic.countDocuments(),
    Task.countDocuments(),
    Profile.countDocuments()
  ]);

  if (subjectCount === 0) await Subject.insertMany(defaultSubjects);
  if (weakCount === 0) await WeakTopic.insertMany(defaultWeakTopics);
  if (taskCount === 0) await Task.insertMany(defaultTasks);
  if (profileCount === 0) await Profile.create(defaultProfile);

  await Promise.all([QuizSession.countDocuments(), TutorMessage.countDocuments()]);
}

export async function connectDatabase({ mongoUri, allowMemoryFallback = true } = {}) {
  if (mongoose.connection.readyState === 1) {
    return { mode: connectedMode || "primary" };
  }

  const uri = mongoUri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyai";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    connectedMode = "primary";
    await seedIfEmpty();
    return { mode: connectedMode };
  } catch (error) {
    if (!allowMemoryFallback) {
      throw error;
    }

    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri("studyai");
    await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 3000 });
    connectedMode = "memory";
    await seedIfEmpty();
    return { mode: connectedMode };
  }
}

export async function stopDatabase() {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
