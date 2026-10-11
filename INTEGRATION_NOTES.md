# SmartRecruit integration update

## Candidate profile source of truth

The backend no longer independently extracts resume text, infers skills, or analyzes GitHub repositories in `controllers/profile.controller.js`. It stores the resume and GitHub username, then invokes the FastAPI ML service. The ML service's `candidate_profile` response is stored as `candidateProfileJson`; the backend only maps a few display fields for the existing schema. Interview status is available from `GET /api/profile/interview`.

## Environment setup

For security, actual `.env` files were excluded from this archive. Copy each `.env.example` to `.env` in `backend/`, `ml/`, and `frontend/`, then restore your own credentials locally. Never commit `.env` files. Use the same random `ML_API_KEY` in `backend/.env` and `ml/.env`, and set `GEMINI_API_KEY` in `ml/.env`.

## Important

The archive contains source updates but has not been tested against your live MongoDB/Gemini accounts. After extracting, install dependencies and test the profile upload flow.
