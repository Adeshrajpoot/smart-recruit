# Recruiter login and backend data integration

## What changed

- Recruiter login calls `POST /api/auth/login` with `role: "recruiter"`; the backend validates the stored account role after validating the password. Recruiter/admin accounts can use the recruiter portal, while candidate login explicitly requests the candidate role.
- After login, the frontend calls `GET /api/auth/me` using the returned JWT and stores the profile returned by MongoDB. The recruiter dashboard routes are protected by a backend-verified session check.
- `GET /api/recruiter/dashboard` returns recruiter-scoped dashboard statistics, assessments, and recent attempts.
- `GET /api/recruiter/candidates` returns candidates who have attempts on the recruiter’s drives or have been invited to those drives.
- `GET /api/recruiter/candidate/:attemptId` loads the selected attempt, saved evaluation/scorecard, and submitted answers. `POST /api/recruiter/candidate/:attemptId/decision` saves the recruiter decision and note against the scorecard. These routes are scoped to the logged-in recruiter’s own drives (admins can access all drives).
- The recruiter name and dashboard/candidate counters no longer rely on the original sample names and counts. Empty data is shown when the database has no matching records.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and set a real `MONGO_URI` and a long random `JWT_SECRET`. Do not commit `.env`.
2. Copy `frontend/.env.example` to `frontend/.env`. For local development, `VITE_API_URL` should point to the backend URL, normally `http://localhost:3500`.
3. Install dependencies in `backend` and `frontend`, then start the backend and frontend using the project scripts.
4. Sign up from the recruiter signup page, verify the email OTP, then log in. Only accounts with the `recruiter` role (or `admin`) can enter the recruiter workspace.

## Verification and current scope

The updated backend JavaScript files pass `node --check`, and all frontend `.js`/`.jsx` files parse successfully. A full Vite production build could not be completed in this environment because the archived `node_modules` is missing the platform-specific Rolldown native binding; reinstalling dependencies on the target machine is required. No live MongoDB connection was available here, so the endpoints were not exercised against real database records.

The assessment-create screen currently saves a drive and an assessment draft. Its displayed question list is still a preview, not database-backed Question records, and adding an email to the local invitation list does not yet send an invitation. Those behaviors are separate from recruiter login and data retrieval.
