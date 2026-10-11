# SmartRecruit recruiter + ML integration audit

## Fixes applied

- Added a recruiter dashboard at `/recruiter/dashboard` and registered the route in React Router.
- Recruiter login now redirects directly to that dashboard. Candidate login sends recruiter-role users to the recruiter dashboard and candidates to their profile flow. The landing page uses the stored account role for its primary navigation.
- Replaced the placeholder `GET /api/drives` handler with a database-backed drive listing. Recruiters see only drives they created; admins can see all; candidate listing remains limited to active drives. Read/update/delete/invite operations enforce ownership for recruiters.
- Added the recruiter workspace UI to create and list drives. The drive dashboard calls `/api/auth/me` to confirm the role instead of trusting localStorage alone.
- Connected the trained job-role classifier to the backend's profile-processing job. Job prediction is optional: if it fails, a valid resume/GitHub interview can still be saved.
- Connected actual browser camera frames to MediaPipe Face Landmarker. The model is loaded from `frontend/public/models/face_landmarker.task`; frames are processed in the browser. The app sends only aggregated metrics to the FastAPI XGBoost classifier, not camera frames. Gaze direction is an approximate iris-position estimate, not a validated or medical-grade gaze tracker.
- Removed fake random eye/gaze activity samples and fake random confidence values from the assessment page. The UI displays the classifier's returned label and score. Left/right glances alone no longer set an activity flag; no-face, multiple-face and looking-away results may be flagged for review.
- Fixed FastAPI decoding of XGBoost numeric predictions to the activity names used by the frontend. The classifier now returns both `predicted_activity` and a model score derived from `predict_proba`.
- Fixed the assessment page camera startup order so the video element exists after generated questions finish loading. Candidate name/email are initialized from localStorage without effect-driven state updates.
- The candidate interview API removes answer-key fields from questions returned to the browser. Correct answers remain available only to server-side data.
- Removed log statements that printed email configuration details and registration OTPs.
- Made the optional seed script require recruiter credentials from environment variables, stop overwriting existing passwords, and avoid deleting existing assessments.
- Replaced hardcoded sample candidate details and fake “98% face presence” values on the assessment completion screen with the actual stored submission data or a clearly empty/not-recorded state.
- The pre-assessment system check now cleans up its temporary camera stream and the active assessment uses the selected camera ID when still available.
- Added `.env.example` files; real `.env` files and secrets are not included in this archive.

## Model audit results (local, non-production tests)

- **Face/activity XGBoost model:** loaded successfully. FastAPI smoke tests passed for health, API-key rejection/acceptance, and predictions. Example metric vectors predicted `NORMAL`, `NO_FACE`, and `MULTIPLE_FACES` as expected. The returned score is the model's maximum class probability; it has not been calibrated for real-world confidence.
- **Job-role classifier:** loaded and returned `Full Stack Developer` for a generated, synthetic resume PDF. This verifies inference code can run; it does not establish accuracy on real candidate resumes.
- **Interview endpoint contract:** FastAPI accepted the multipart `resume` PDF and `github_username` fields and returned the expected `candidate_profile` / `interview` response in an endpoint smoke test. The two Gemini-backed Python subprocesses were mocked for that route test, so this is not a live Gemini generation test. The uploaded project contained a sample questions JSON with 45 questions and A/B/C/D options; that sample output is not used as a runtime fallback.
- **Syntax checks:** all backend JavaScript files passed `node --check`; all Python files parsed with `ast.parse`; the modified frontend files passed targeted ESLint and JSX parse checks.

## Important limitations still present

- The eye/gaze estimate uses iris location relative to eye corners and can be affected by camera angle, head rotation, lighting, glasses, accessibility needs, and ordinary behavior. The classifier training dataset in this project is synthetic; its reported 0.89 accuracy is on a synthetic holdout split, not a real-world camera benchmark. Do not use it alone to decide cheating or candidate suitability.
- The browser loads MediaPipe Tasks Vision/WASM from jsDelivr at runtime, so the candidate browser needs internet access to that CDN as well as permission to use a camera. If the import/model cannot load, the UI reports the tracker unavailable rather than generating random values.
- Personalized MCQ generation/resume extraction depends on the external Gemini API and GitHub access. These live APIs were not called as part of this local audit.
- The personalized assessment now posts its answers and proctoring summary to `POST /api/profile/interview/submit`, persists them in `CandidateInterviewResult`, and exposes them in the recruiter list and review page. The separate database-backed Attempts/Submission/Evaluation pipeline remains a different flow; the personalized MCQ interview still has no automated answer scoring. Existing pre-fix localStorage submissions can sync only their summary because the old frontend did not save individual answers.
- A full Vite production build could not run in the current Linux validation container because the supplied `node_modules` contains macOS-only native optional dependencies. The archive excludes `node_modules`; run `npm install` in the frontend folder on your Mac before `npm run build`.

## Local setup

1. Copy `backend/.env.example` to `backend/.env`, `ml/.env.example` to `ml/.env`, and `frontend/.env.example` to `frontend/.env`.
2. Generate one secret with `openssl rand -hex 32`; replace the sample `ML_API_KEY` in both `backend/.env` and `ml/.env` with that same 64-character value. Set your own MongoDB URI, JWT secret, Gemini API key, and optional GitHub token.
3. In three terminals, run `npm install && npm run dev` inside `backend`, `python3 -m pip install -r requirements.txt && python3 main.py` inside `ml`, and `npm install && npm run dev` inside `frontend`.
4. For accounts registered before recruiter-role handling was fixed, inspect the user's `role` field in MongoDB. Change it to `recruiter` only for a verified recruiter account, or register again with a new email. Log out and back in afterward so a fresh token is issued.


## Candidate submission-to-recruiter fix (2026-10-11)

- Added `backend/models/CandidateInterviewResult.js` to persist candidate identity, selected answers, question text/options, completion counts, receipt, role prediction, and the aggregated proctoring values.
- Added authenticated candidate endpoints `POST /api/profile/interview/submit` and `POST /api/profile/interview/submit-summary`. The first saves full responses for newly completed tests; the second imports a pre-fix summary from browser storage and marks it as summary-only.
- Updated `CandidateActiveAssessment.jsx` so it awaits the backend save before navigating to the completion page and displays a retryable error if saving fails. The currently selected answer is included when the candidate submits.
- Updated recruiter dashboard/list/review/decision endpoints to include the personalized interview records. The candidate list and dashboard refresh every 15 seconds.
- Scope limitation: personalized interview results currently appear in the shared recruiter workspace because the existing ML interview flow does not associate the session with a recruiter or hiring drive. For a production multi-recruiter deployment, associate each candidate interview with an invitation/drive and enforce recruiter ownership before exposing results.
- Legacy limitation: pre-fix browser data contained only the response count and monitoring summary; individual answers were never posted/stored and cannot be reconstructed.
