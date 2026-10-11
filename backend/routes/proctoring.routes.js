import express from "express";

import {
  createProctoringEvent,
  getProctoringEvaluation,
  generateProctoringEvaluation
} from "../controllers/proctoring.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/:attemptId/event", createProctoringEvent);

router.get("/:attemptId", getProctoringEvaluation);

router.post("/:attemptId/evaluate", generateProctoringEvaluation);

export default router;