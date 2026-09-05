import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.ts";
import uploadRoute from "./routes/uploadRoute.ts";
import patientRoute from "./routes/patientRoute.ts";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev
      }
    },
    credentials: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(cookieParser());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "Medicall / RetinalAI Backend", timestamp: new Date() });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "Medicall / RetinalAI Backend", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/scans", uploadRoute);
app.use("/api/detail", patientRoute);
app.use("/api/patients", patientRoute);

// 404 Handler
app.use((req: Request, res: Response) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` })
);

export default app;
