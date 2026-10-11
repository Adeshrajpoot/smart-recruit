import fs from "fs";
import path from "path";

import { env } from "../env.js";

// Small client for the Python ML service in /ml (FastAPI).
// Every call sends X-API-Key when ML_API_KEY is configured.

const buildHeaders = () =>
  env.mlApiKey ? { "X-API-Key": env.mlApiKey } : {};

const request = async (
  endpoint,
  options = {},
  timeoutMs = env.mlTimeoutMs
) => {
  let response;

  try {
    response = await fetch(`${env.mlApiUrl}${endpoint}`, {
      ...options,
      headers: {
        ...buildHeaders(),
        ...(options.headers || {})
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    const err = new Error(
      `ML service unreachable at ${env.mlApiUrl}: ${error.message}`
    );
    err.statusCode = 503;
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(
      data.detail || data.message || "ML service error"
    );
    err.statusCode = response.status;
    throw err;
  }

  return data;
};

// `source` is either a Buffer (preferred) or a path on disk.
const buildResumeForm = (source, originalName) => {
  const form = new FormData();
  const bytes = Buffer.isBuffer(source)
    ? source
    : fs.readFileSync(source);

  form.append(
    "resume",
    new Blob([bytes], { type: "application/pdf" }),
    originalName ||
      (typeof source === "string"
        ? path.basename(source)
        : "resume.pdf")
  );

  return form;
};

export const mlHealth = () => request("/health", {}, 5000);

export const predictJobRole = async (
  filePath,
  originalName
) => {
  const data = await request(
    "/predict-job",
    {
      method: "POST",
      body: buildResumeForm(filePath, originalName)
    },
    60000
  );

  return data.predicted_job_role;
};

export const generateInterview = async (
  filePath,
  originalName,
  githubUsername
) => {
  const form = buildResumeForm(filePath, originalName);
  form.append("github_username", githubUsername);

  return request("/interview/generate", {
    method: "POST",
    body: form
  });
};

export const predictFaceActivity = async (metrics) => {
  const data = await request(
    "/predict-face-activity",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics)
    },
    15000
  );

  return {
    predictedActivity: data.predicted_activity,
    confidence: Number(data.confidence || 0),
  };
};
