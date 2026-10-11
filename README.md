# SmartRecruit – frontend + backend + ML

    smartrecruit/
      frontend/   React + Vite            (port 5173)
      backend/    Express + MongoDB       (port 3500)
      ml/         FastAPI + scikit/XGBoost + Gemini (port 8000)

Flow: **Browser → backend → ML**. The browser never talks to the ML service directly.

## Quick start (everything is pre-configured)

`.env` files for `ml/`, `backend/` and `frontend/` are included and already filled in
(Gemini + GitHub keys, a generated JWT secret, local MongoDB, all service URLs).

    Mac/Linux:  ./start-local.sh
    Windows:    start-local.bat

Then open http://localhost:5173. The script starts MongoDB in Docker if it isn't already running.
If you already have your own `.env` files (e.g. with an Atlas `MONGO_URI` or Gmail app password), copy them over these.

* Signup OTP: if `EMAIL_USER`/`EMAIL_PASS` are empty, no email is sent - the OTP is printed in the backend terminal (`REGISTRATION OTP: 123456`).
* Recruiter test login (after `cd backend && npm run seed`): `recruiter@smartrecruit.com` / `Recruiter@123`.

## Run locally (manual)

Prerequisites: Node 20+, Python 3.10–3.12, MongoDB (local) or a MongoDB Atlas URI.

1. Copy the three `.env.example` files to `.env` and fill them in
   - `ml/.env`: `GEMINI_API_KEY` (required), `GITHUB_TOKEN` (optional)
   - `backend/.env`: `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`/`EMAIL_PASS`, `GOOGLE_CLIENT_ID`
   - `frontend/.env`: `VITE_API_URL=http://localhost:3500`
2. Run everything: `./start-local.sh` (Mac/Linux) or `start-local.bat` (Windows)
   — or start each service by hand:

       cd ml       && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python main.py
       cd backend  && npm install && npm run dev
       cd frontend && npm install && npm run dev

3. Open http://localhost:5173. Check http://localhost:3500/health and http://localhost:3500/api/ml/health.

Optional: `docker compose up --build` starts MongoDB + backend + ML (run the frontend with `npm run dev`).

Recruiters cannot self-register (the API always creates candidates); create one with `cd backend && npm run seed`.

## Host online

| Service  | Where (example) | Settings |
|----------|-----------------|----------|
| ML       | Render / Railway web service, root `ml/` | Build `pip install -r requirements.txt`, start `python main.py`, env: `GEMINI_API_KEY`, `GITHUB_TOKEN`, `ML_API_KEY` (a random secret). Needs ≥1 GB RAM. |
| Backend  | Render / Railway web service, root `backend/` | Build `npm install`, start `npm start`, env: everything in `backend/.env.example` with `MONGO_URI` = Atlas, `FRONTEND_URL` = your Vercel URL, `ML_API_URL` = ML service URL, `ML_API_KEY` = same secret as ML. |
| Frontend | Vercel, root `frontend/` | Env: `VITE_API_URL` = backend URL (no trailing slash). `vercel.json` already handles SPA routing. |

Set `FRONTEND_URL` (or `CORS_ORIGINS`) on the backend to every browser origin you use, otherwise the browser blocks requests.
Free hosting tiers sleep when idle, so the first request after a pause can take ~30–60 s.

## API added for the integration

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Backend liveness |
| `GET /api/ml/health` | Backend → ML connectivity check |
| `POST /api/ml/predict-face-activity` (auth) | Proctoring metrics → ML activity label |
| `POST /api/profile/analyze` (auth) | Existing; now also stores ML predicted job role |
| `POST /api/profile/interview` (auth) | Resume + GitHub → ML-generated personalised questions (slow, up to ~5 min) |

See `CHANGES.md` for the full list of edits.
