import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase, stopDatabase } from "./db.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyai";

async function start() {
  try {
    const result = await connectDatabase({
      mongoUri,
      allowMemoryFallback: true
    });

    console.log(`Database mode: ${result.mode}`);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();

process.on("SIGINT", async () => {
  await stopDatabase();
  process.exit(0);
});
