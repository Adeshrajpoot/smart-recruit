import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import driveRoutes from "./routes/drive.routes.js";
import questionRoutes from "./routes/question.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import proctoringRoutes from "./routes/proctoring.routes.js";
import mlRoutes from "./routes/ml.routes.js";
import scorecardRoutes from "./routes/scorecard.routes.js";
import recruiterRoutes from "./routes/recruiter.routes.js";
import { env } from "./env.js";

import {
  notFoundMiddleware,
  errorMiddleware
} from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

// Allowed browser origins: local dev + FRONTEND_URL + anything in CORS_ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  env.frontendUrl.replace(/\/$/, ""),
  ...env.corsOrigins
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser clients (curl, server-to-server) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: /uploads is intentionally NOT served publicly (resumes are private).

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartRecruit Backend Running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "SmartRecruit Backend" });
});

app.use("/api/auth", authRoutes);
console.log("DRIVE ROUTES LOADED");
app.use("/api/drives", driveRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/proctoring", proctoringRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/scorecards", scorecardRoutes);
app.use("/api/recruiter", recruiterRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 3500, () => {
      console.log(
        `Server running on http://localhost:${process.env.PORT || 3500}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
    console.error(
      "Start MongoDB (or set MONGO_URI to a MongoDB Atlas URI in backend/.env) and restart."
    );
    process.exit(1);
  });