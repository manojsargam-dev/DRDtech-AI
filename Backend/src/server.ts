import dotenv from "dotenv";
dotenv.config();

import app from "./app.ts";
import connectDB from "./db/db.ts";
import { cloudy } from "./services/storage.service.ts";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    cloudy();

    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING on port ${PORT} 🚀`);
    });
  } catch (err: any) {
    console.error("Failed to initialize database:", err?.message || err);
    // Still allow server to listen for health checks and requests
    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING (DB retry in progress) on port ${PORT} 🚀`);
    });
  }
}

startServer();