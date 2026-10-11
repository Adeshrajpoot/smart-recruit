# Changes made to integrate frontend, backend and ML

Core logic, UI, models, routes and ML algorithms are unchanged. Edits below are only what was needed to connect the three parts and make them run locally and online.

## ML (`ml/`, was `TASK 4  2`)
| File | Change |
|------|--------|
| `gemini_config.py` | **Security:** hard-coded Gemini key removed; read from `GEMINI_API_KEY` (env or `.env`). |
| `github_config.py` | **Security:** hard-coded GitHub token removed; read from `GITHUB_TOKEN`. |
| `final_candidate_profile.py` | GitHub `Authorization` header only sent if a token is set (works unauthenticated, lower rate limit). |
| `main.py` | CORS origins from `CORS_ORIGINS` env; optional `X-API-Key` check (`ML_API_KEY`) on the 3 ML endpoints (`/health` stays open); loads `.env`; `python main.py` starts uvicorn on `$PORT` (default 8000). |
| `requirements.txt` (new) | All dependencies; `scikit-learn==1.6.1` pinned because `job_predictor.pkl` was pickled with it. |
| `.env.example`, `.gitignore`, `Dockerfile`, `.dockerignore` (new) | Config template / hosting. |
| Removed from the package | `.git`, `.vscode`, `.DS_Store`, `__pycache__`, `__MACOSX` (junk). |

## Backend (`backend/`)
| File | Change |
|------|--------|
| `env.js` | Added `CORS_ORIGINS`, `ML_API_URL` (default http://localhost:8000), `ML_API_KEY`, `ML_TIMEOUT_MS`. |
| `index.js` | CORS now built from local dev origins + `FRONTEND_URL` + `CORS_ORIGINS` (the hard-coded Vercel URL is no longer needed in code – set it as `FRONTEND_URL`); added `GET /health`; mounted `/api/ml`. |
| `services/mlService.js` (new) | Client for the ML service (job prediction, interview generation, face activity, health), timeouts, API-key header. |
| `controllers/ml.controller.js`, `routes/ml.routes.js` (new) | `GET /api/ml/health`, `POST /api/ml/predict-face-activity` (maps frontend camelCase → ML snake_case). |
| `controllers/profile.controller.js` | **Bug fix:** `pdfParse` and `parser` were undefined, so `/api/profile/analyze` always crashed → switched to the pdf-parse v2 `PDFParse` API. Now also calls ML job prediction (non-fatal: profile still saves if ML is down) and stores `mlCategory`. New `generateCandidateInterview` handler. |
| `routes/profile.routes.js` | Added `POST /api/profile/interview`. |
| `models/CandidateProfile.js` | Added `mlInterview` field. |
| `package.json` | Added `engines: node >=20`. |
| `.env.example`, `Dockerfile`, `.dockerignore`, `README.md` | New/updated. |

## Frontend (`frontend/`)
| File | Change |
|------|--------|
| `src/config.js` (new) | One `API_URL` (`VITE_API_URL`, falls back to http://localhost:3500). |
| `src/services/api.js` | Uses `API_URL`, auto-sends the saved JWT, tolerates non-JSON errors; added `apiUpload` for file uploads. |
| `SignUpPage.jsx`, `CandidateVerifyOtp.jsx` | Use shared `API_URL` (OTP page no longer blocks when `VITE_API_URL` is unset). |
| `CandidateLogin.jsx` | Was a mock (any input → fake token, pre-filled with a demo email); now calls `POST /api/auth/login` and stores the real token/user. |
| `RecruiterLogin.jsx` | Same; also rejects non-recruiter accounts. |
| `CandidateProfileCompletion.jsx` | "Save and continue" uploads resume + GitHub URL to `/api/profile/analyze` (PDF only, as the backend requires); if nothing was chosen it behaves as before. |
| `CandidateActiveAssessment.jsx` | Proctoring tick now asks the XGBoost model via `/api/ml/predict-face-activity`; falls back to the old local value if the backend/ML is unreachable. |
| `.env.example`, `.gitignore` | New / `.env.*` ignored. |

## Root
`README.md`, `CHANGES.md`, `docker-compose.yml`, `start-local.sh`, `start-local.bat`, `.gitignore`.

## Not changed / known limits
* **Rotate the exposed keys.** The Gemini key and GitHub token that were hard-coded in `ml/` were in the zip you shared; treat them as leaked, create new ones and put them in `ml/.env`.
* Face metrics in the assessment page are still simulated in the browser (real tracking lives in `ml/facwe detection/eye_detection.py`, a desktop OpenCV script). The ML model is called with those simulated values.
* The assessment questions, scoring screens and submission receipt in the frontend are still static; wiring them to `/api/assessment`, `/api/attempts` etc. was not part of this pass, and `POST /api/profile/interview` isn't called from any page yet.
* `backend/ml_export/` and the sample `ml/*.json` / `resume.pdf` contain sample/personal data; delete before publishing.
* Verified here: all backend JS passes `node --check`, all frontend files parse, ML Python compiles, and the backend ML client was exercised against a mock server. I could not `npm install`/`pip install` in this environment, so a full run (Mongo + Vite build + real models) still needs to be done on your machine.


---
# Round 2 (production-readiness pass)
* `frontend/CandidateResetPassword.jsx`: was fake; now calls `/api/auth/forgot-password` and `/api/auth/reset-password`.
* `backend/index.js`: removed public `/uploads` (resumes were downloadable by URL); exits with a clear message if MongoDB is unreachable.
* `backend/routes/proctoring.routes.js`: all routes now require login.
* `backend/models/CandidateProfile.js` + `controllers/profile.controller.js`: resume PDF stored in the DB (survives ephemeral hosting disks), temp file deleted; ML interview generation now runs as a background job after `/api/profile/analyze` (`POST /api/profile/interview` restarts it, `GET /api/profile/interview` returns `status` = none|pending|ready|failed and the questions).
* `backend/services/mlService.js`: accepts a Buffer or a file path.
* `backend/seed.js`: recruiter account had a fake password hash and was unverified (could never log in); now `recruiter@smartrecruit.com` / `Recruiter@123`, verified.
* `.env` files for ml/backend/frontend included; `frontend/.env.example`, `backend/.env.example` (ML_API_KEY) completed.
* `start-local.sh` / `.bat`: pick a compatible Python (3.10-3.13), auto-start MongoDB via Docker if needed.


## Candidate test persistence fix (2026-10-11)

| File | Change |
|------|--------|
| `backend/models/CandidateInterviewResult.js` (new) | Stores candidate interview submissions, selected answers, response states, and proctoring summary in MongoDB. |
| `backend/controllers/profile.controller.js` | Adds candidate-only full submission and legacy-summary sync handlers with request validation and idempotent session handling. |
| `backend/routes/profile.routes.js` | Mounts `/api/profile/interview/submit` and `/api/profile/interview/submit-summary`. |
| `backend/controllers/recruiter.controller.js` | Includes submitted personalized interviews in candidate totals, recent activity, candidate listing, review, and recruiter decision storage. |
| `frontend/src/pages/Candidate/CandidateActiveAssessment.jsx` | Sends the interview to the backend before navigating; retains the session and shows an error if persistence fails. |
| `frontend/src/pages/Candidate/AssessmentComplete.jsx` | One-time sync of old browser-stored summaries; it cannot restore individual answers that the old frontend never saved. |
| `frontend/src/pages/Recruiter/CandidatesMonitoring.jsx`, `RecruiterDashboard.jsx` | Refresh recruiter activity from the API every 15 seconds. |
| `frontend/src/pages/Recruiter/CandidateAssessmentReview.jsx` | Describes saved personalized MCQ answers and proctoring summary without implying an automated score exists. |

Validation in this environment: changed backend files pass `node --check`; changed JSX files pass TypeScript's JSX syntax parser. A full Vite build and live MongoDB submission/login test could not be run because dependencies and a configured database are not available here. Personalized results are currently shown in a shared recruiter workspace until candidate sessions are attached to specific drives/recruiters.
