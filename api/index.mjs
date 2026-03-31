import app from "../server/src/app.js";
import { connectDatabase } from "../server/src/db.js";

let initialized = null;

async function ensureReady() {
  if (!initialized) {
    initialized = connectDatabase({
      mongoUri: process.env.MONGO_URI,
      allowMemoryFallback: false
    });
  }

  return initialized;
}

export default async function handler(req, res) {
  try {
    await ensureReady();
    return app(req, res);
  } catch (_error) {
    return res.status(500).json({
      message: "Database connection failed on Vercel. Set MONGO_URI in Vercel environment variables."
    });
  }
}
