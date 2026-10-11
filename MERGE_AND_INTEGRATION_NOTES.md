# SmartRecruit merged frontend and integration notes

This project combines the established SmartRecruit 4 frontend/backend/ML tree with the additional recruiter UI pages from SmartRecruit(4).zip. Existing candidate pages and the ML interview flow are retained.

## Added frontend routes
- `/recruiter/candidates` — candidate monitoring UI
- `/recruiter/assessments/create` — assessment creation UI
- `/recruiter/candidates/:candidateId/review` — recruiter review/scorecard UI

## Backend change
Mounted the existing scorecard router at `/api/scorecards`, enabling its existing endpoints:
- `POST /api/scorecards/:attemptId/generate`
- `GET /api/scorecards/:attemptId`
- `PATCH /api/scorecards/:attemptId/decision`

## Important integration status
The added UI originally calls `/api/recruiter/candidates`, `/api/recruiter/candidate/:candidateId`, `/api/recruiter/candidate/:candidateId/decision`, and `/api/assessments/create`. Those endpoints are not defined by the original backend in this archive. They must be adapted to the backend's real data model before those particular screens can be considered fully functional end-to-end. The assessment-create UI should use `POST /api/assessment/` (singular) if its request body matches `createAssessment`'s schema. Scorecard API routes use an **attempt ID**, not a candidate ID. Do not treat placeholder scores in the UI as actual evaluations.

## Setup
Install dependencies separately in `frontend`, `backend`, and `ml` as described in the README. Environment files with credentials are intentionally omitted from this merged archive; recreate them from the provided `.env.example` files and use your own keys.
