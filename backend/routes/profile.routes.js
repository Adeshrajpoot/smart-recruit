import express from "express";

import {
  analyzeCandidateProfile,
  getCandidateProfile,
  generateCandidateInterview,
  getCandidateInterview,
  submitCandidateInterview,
  syncLegacyCandidateInterviewSummary
} from "../controllers/profile.controller.js";

import upload from "../middleware/resumeUpload.middleware.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
  analyzeCandidateProfile
);

router.get(
  "/",
  authMiddleware,
  getCandidateProfile
);

router.post(
  "/interview",
  authMiddleware,
  generateCandidateInterview
);

router.get(
  "/interview",
  authMiddleware,
  getCandidateInterview
);

router.post(
  "/interview/submit",
  authMiddleware,
  roleMiddleware("candidate"),
  submitCandidateInterview
);

router.post(
  "/interview/submit-summary",
  authMiddleware,
  roleMiddleware("candidate"),
  syncLegacyCandidateInterviewSummary
);

export default router;
