import fs from "fs";

import CandidateProfile from "../models/CandidateProfile.js";
import CandidateInterviewResult from "../models/CandidateInterviewResult.js";
import User from "../models/User.js";
import { randomBytes, createHash } from "node:crypto";
import { getGithubUsername } from "../utils/github.js";
import { generateInterview, predictJobRole } from "../services/mlService.js";

const normalizeMlProfile = (candidateProfile, user) => {
  const candidate = candidateProfile?.candidate || {};
  const resume = candidate.resume || {};

  return {
    name: resume.name || user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    skills: Array.isArray(resume.skills) ? resume.skills : [],
    projects: Array.isArray(resume.projects)
      ? resume.projects.map((project) => ({
          name: project.name || "",
          description: project.description || "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies
            : [],
          githubUrl: ""
        }))
      : [],
    education: Array.isArray(resume.education)
      ? resume.education.map((item) => ({
          institution: item.institution || "",
          degree: item.degree || "",
          year: item.end_date || item.start_date || ""
        }))
      : [],
    experience: Array.isArray(resume.experience)
      ? resume.experience.map((item) => ({
          company: item.company || "",
          role: item.role || "",
          description: Array.isArray(item.achievements)
            ? item.achievements.join("; ")
            : ""
        }))
      : []
  };
};

export const analyzeCandidateProfile = async (req, res) => {
  try {
    const { githubUrl } = req.body || {};

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required"
      });
    }

    if (!githubUrl) {
      return res.status(400).json({
        success: false,
        message: "GitHub profile URL is required"
      });
    }

    if (!req.file.originalname?.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume"
      });
    }

    let githubUsername;
    try {
      githubUsername = getGithubUsername(githubUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Enter a valid GitHub profile URL"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const pdfBuffer = await fs.promises.readFile(req.file.path);
    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          github: {
            username: githubUsername,
            profileUrl: `https://github.com/${githubUsername}`,
            repositories: []
          },
          resume: {
            fileName: req.file.originalname,
            filePath: "",
            data: pdfBuffer,
            uploadedAt: new Date()
          },
          mlInterview: null,
          mlInterviewStatus: "pending",
          mlInterviewError: "",
          candidateProfileJson: null,
          mlCategory: null
        },
        $setOnInsert: {
          userId: user._id
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    fs.promises.unlink(req.file.path).catch(() => {});

    // The ML service is the single source of truth for resume/GitHub analysis
    // and personalized interview generation. It runs asynchronously so the
    // upload request does not wait for the Gemini calls to finish.
    runInterviewJob(user._id).catch((error) => {
      console.error("Candidate ML job failed:", error.message);
    });

    return res.status(202).json({
      success: true,
      message: "Resume and GitHub data submitted for ML analysis",
      profileId: profile._id,
      status: "pending"
    });
  } catch (error) {
    console.error("Candidate profile error:", error);
    if (req.file?.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({
      success: false,
      message: "Failed to start candidate profile analysis"
    });
  }
};

export const getCandidateProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({
      userId: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found"
      });
    }

    return res.json({
      success: true,
      status: profile.mlInterviewStatus || "none",
      candidateProfile: profile.candidateProfileJson || null,
      profileId: profile._id
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// The ML service extracts the resume, analyzes GitHub, creates the candidate
// profile, and generates interview questions. The backend only persists its
// output; it does not independently rebuild the candidate profile.
export const runInterviewJob = async (userId) => {
  const profile = await CandidateProfile.findOne({ userId }).select("+resume.data");

  if (!profile || !profile.resume?.data || !profile.github?.username) {
    return;
  }

  profile.mlInterviewStatus = "pending";
  profile.mlInterviewError = "";
  await profile.save();

  try {
    // Generate the personalized interview and predict a role in parallel. The
    // role classifier is optional: its failure must not discard valid questions.
    const [result, predictedRole] = await Promise.all([
      generateInterview(
        profile.resume.data,
        profile.resume.fileName,
        profile.github.username
      ),
      predictJobRole(
        profile.resume.data,
        profile.resume.fileName
      ).catch((error) => {
        console.warn("Job-role prediction unavailable:", error.message);
        return null;
      })
    ]);

    if (!result?.candidate_profile || !result?.interview) {
      throw new Error("ML service returned an incomplete candidate profile or interview");
    }

    if (predictedRole) {
      result.candidate_profile.predictedJobRole = predictedRole;
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found while saving ML results");
    }

    profile.candidateProfileJson = result.candidate_profile;
    profile.profile = normalizeMlProfile(result.candidate_profile, user);
    profile.mlInterview = result.interview;
    profile.mlInterviewStatus = "ready";
    profile.mlInterviewError = "";

    const rolePrediction =
      result.candidate_profile?.predictedJobRole ||
      result.candidate_profile?.candidate?.predictedJobRole;
    if (typeof rolePrediction === "string") {
      profile.mlCategory = rolePrediction;
    }
  } catch (error) {
    console.warn("Interview generation failed:", error.message);
    profile.mlInterviewStatus = "failed";
    profile.mlInterviewError = error.message;
  }

  await profile.save();
};

export const generateCandidateInterview = async (req, res) => {
  const profile = await CandidateProfile.findOne({
    userId: req.user.id
  });

  if (!profile || !profile.github?.username || !profile.resume?.data) {
    return res.status(404).json({
      success: false,
      message: "Upload a resume and provide a GitHub profile first"
    });
  }

  if (profile.mlInterviewStatus !== "pending") {
    runInterviewJob(req.user.id).catch((error) => {
      console.error("Interview retry failed:", error.message);
    });
  }

  return res.status(202).json({
    success: true,
    status: "pending"
  });
};

export const getCandidateInterview = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({
      userId: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found"
      });
    }

    return res.json({
      success: true,
      status: profile.mlInterviewStatus || "none",
      error: profile.mlInterviewError || "",
      interview:
        profile.mlInterviewStatus === "ready" && profile.mlInterview
          ? {
              ...profile.mlInterview,
              questions: Array.isArray(profile.mlInterview.questions)
                ? profile.mlInterview.questions.map(({ correct_answer, correctAnswer, ...question }) => question)
                : []
            }
          : null
    });
  } catch (error) {
    console.error("Get candidate interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const submitCandidateInterview = async (req, res) => {
  try {
    if (req.user?.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidate accounts can submit this interview." });
    }

    const sessionId = String(req.body?.sessionId || "").trim();
    const rawQuestions = req.body?.questions;
    if (!sessionId || sessionId.length > 120) {
      return res.status(400).json({ success: false, message: "A valid interview session ID is required." });
    }
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0 || rawQuestions.length > 100) {
      return res.status(400).json({ success: false, message: "Submit between 1 and 100 interview questions." });
    }

    const [user, profile] = await Promise.all([
      User.findById(req.user.id).select("name email role"),
      CandidateProfile.findOne({ userId: req.user.id }).select("mlCategory profile.skills candidateProfileJson")
    ]);
    if (!user) return res.status(404).json({ success: false, message: "Candidate account was not found." });

    const questions = rawQuestions.map((item, index) => {
      const options = Array.isArray(item?.options)
        ? item.options.slice(0, 12).map((option) => ({
            id: String(option?.id ?? "").slice(0, 80),
            title: String(option?.title ?? "").slice(0, 1000)
          }))
        : [];
      const selectedOptionId = item?.savedAnswer == null ? "" : String(item.savedAnswer).slice(0, 80);
      const selectedOptionText = options.find((option) => option.id === selectedOptionId)?.title || "";
      const status = ["saved", "skipped", "unattempted"].includes(item?.status) ? item.status : (selectedOptionId ? "saved" : "unattempted");
      const parsedPoints = Number(item?.points);
      return {
        questionId: String(item?.id ?? index + 1).slice(0, 80),
        prompt: String(item?.prompt ?? "").trim().slice(0, 4000),
        topic: String(item?.topic ?? item?.mlCalibratedTag ?? "").slice(0, 300),
        difficulty: String(item?.difficulty ?? "").slice(0, 100),
        options,
        selectedOptionId,
        selectedOptionText,
        responseStatus: status,
        points: Number.isFinite(parsedPoints) ? Math.min(100, Math.max(0, parsedPoints)) : 0
      };
    }).filter((item) => item.prompt);

    if (!questions.length) {
      return res.status(400).json({ success: false, message: "No valid question text was included in the submission." });
    }

    const analytics = req.body?.proctoringAnalytics && typeof req.body.proctoringAnalytics === "object"
      ? req.body.proctoringAnalytics
      : {};
    const safeAnalytics = {
      facePresencePct: Number.isFinite(Number(analytics.facePresencePct)) ? Math.min(100, Math.max(0, Number(analytics.facePresencePct))) : 0,
      gazeDistribution: {
        center: Number(analytics.gazeDistribution?.center) || 0,
        left: Number(analytics.gazeDistribution?.left) || 0,
        right: Number(analytics.gazeDistribution?.right) || 0
      },
      maxFacesDetected: Math.max(0, Number(analytics.maxFacesDetected) || 0),
      longestFaceAbsenceSecs: Math.max(0, Number(analytics.longestFaceAbsenceSecs) || 0),
      multipleFaceDurationSecs: Math.max(0, Number(analytics.multipleFaceDurationSecs) || 0),
      lookingAwayEvents: Math.max(0, Number(analytics.lookingAwayEvents) || 0),
      tabSwitchesCount: Math.max(0, Number(analytics.tabSwitchesCount) || 0),
      finalActivityStatus: String(analytics.finalActivityStatus || "NOT RECORDED").slice(0, 120),
      finalVisualFlag: String(analytics.finalVisualFlag || "NO").slice(0, 40),
      flagReason: String(analytics.flagReason || "").slice(0, 1000)
    };

    const answeredQuestions = questions.filter((question) => question.responseStatus === "saved" && question.selectedOptionId).length;
    const receiptRef = `REC-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const result = await CandidateInterviewResult.findOneAndUpdate(
      { candidate: user._id, sessionId },
      {
        $setOnInsert: {
          candidate: user._id,
          candidateProfile: profile?._id || null,
          candidateJobRole: String(profile?.mlCategory || profile?.candidateProfileJson?.predictedJobRole || profile?.candidateProfileJson?.candidate?.predictedJobRole || "").slice(0, 200),
          sessionId,
          assessmentTitle: String(req.body?.assessmentTitle || "Personalized AI Technical Interview").slice(0, 200),
          status: "submitted",
          questions,
          totalQuestions: questions.length,
          answeredQuestions,
          proctoringAnalytics: safeAnalytics,
          receiptRef,
          submittedAt: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: "Interview responses and monitoring data saved to the database.",
      resultId: String(result._id),
      receiptRef: result.receiptRef,
      status: result.status,
      savedResponsesCount: result.answeredQuestions,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    if (error?.code === 11000) {
      try {
        const existing = await CandidateInterviewResult.findOne({ candidate: req.user.id, sessionId: String(req.body?.sessionId || "") });
        if (existing) return res.json({ success: true, message: "This interview submission was already saved.", resultId: String(existing._id), receiptRef: existing.receiptRef, status: existing.status, savedResponsesCount: existing.answeredQuestions, submittedAt: existing.submittedAt });
      } catch { /* fall through to the generic failure response */ }
    }
    console.error("Submit candidate interview error:", error);
    return res.status(500).json({ success: false, message: "Could not save your interview. Please try submitting again." });
  }
};


// One-time bridge for completion summaries saved by older frontend versions.
// Those versions did not send per-question answers to the backend, so only the
// submitted response count and monitoring summary can be restored.
export const syncLegacyCandidateInterviewSummary = async (req, res) => {
  try {
    if (req.user?.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidate accounts can sync their interview summary." });
    }
    const legacy = req.body || {};
    const oldReceipt = String(legacy.receiptRef || "").trim().slice(0, 80);
    if (!oldReceipt) return res.status(400).json({ success: false, message: "A previous submission receipt is required." });

    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ success: false, message: "Candidate account was not found." });
    const profile = await CandidateProfile.findOne({ userId: user._id }).select("mlCategory candidateProfileJson");
    const sessionId = `legacy-${String(user._id)}-${oldReceipt}`.slice(0, 120);
    const oldAnalytics = legacy.proctoringAnalytics && typeof legacy.proctoringAnalytics === "object" ? legacy.proctoringAnalytics : {};
    const analytics = {
      facePresencePct: Math.min(100, Math.max(0, Number(oldAnalytics.facePresencePct) || 0)),
      gazeDistribution: { center: Number(oldAnalytics.gazeDistribution?.center) || 0, left: Number(oldAnalytics.gazeDistribution?.left) || 0, right: Number(oldAnalytics.gazeDistribution?.right) || 0 },
      maxFacesDetected: Math.max(0, Number(oldAnalytics.maxFacesDetected) || 0),
      longestFaceAbsenceSecs: Math.max(0, Number(oldAnalytics.longestFaceAbsenceSecs) || 0),
      multipleFaceDurationSecs: Math.max(0, Number(oldAnalytics.multipleFaceDurationSecs) || 0),
      lookingAwayEvents: Math.max(0, Number(oldAnalytics.lookingAwayEvents) || 0),
      tabSwitchesCount: Math.max(0, Number(oldAnalytics.tabSwitchesCount) || 0),
      finalActivityStatus: String(oldAnalytics.finalActivityStatus || "Legacy summary; activity status not recorded").slice(0, 120),
      finalVisualFlag: String(oldAnalytics.finalVisualFlag || "NO").slice(0, 40),
      flagReason: String(oldAnalytics.flagReason || "").slice(0, 1000)
    };
    const count = Math.max(0, Math.min(100, Number(legacy.savedResponsesCount) || 0));
    const deterministicReceipt = `LEG-${String(user._id).slice(-6)}-${createHash("sha256").update(`${String(user._id)}:${oldReceipt}`).digest("hex").slice(0, 12).toUpperCase()}`;
    const result = await CandidateInterviewResult.findOneAndUpdate(
      { candidate: user._id, sessionId },
      {
        $setOnInsert: {
          candidate: user._id,
          candidateProfile: profile?._id || null,
          candidateJobRole: String(profile?.mlCategory || profile?.candidateProfileJson?.predictedJobRole || profile?.candidateProfileJson?.candidate?.predictedJobRole || "").slice(0, 200),
          sessionId,
          assessmentTitle: String(legacy.assessmentTitle || "Personalized AI Technical Interview").slice(0, 200),
          status: "submitted",
          legacySummaryOnly: true,
          questions: [],
          totalQuestions: 0,
          answeredQuestions: count,
          proctoringAnalytics: analytics,
          receiptRef: deterministicReceipt,
          submittedAt: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    return res.status(201).json({ success: true, message: "Previous interview summary synced. Individual answers were not available in the older frontend.", resultId: String(result._id), receiptRef: result.receiptRef, status: result.status, legacySummaryOnly: Boolean(result.legacySummaryOnly) });
  } catch (error) {
    console.error("Legacy interview summary sync error:", error);
    return res.status(500).json({ success: false, message: "Could not sync the previous interview summary." });
  }
};
