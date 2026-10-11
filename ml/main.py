import os
import sys
import json
import tempfile
import subprocess
from pathlib import Path

import joblib
import pymupdf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

from model_testing import predict_job_from_pdf

FACE_DIR = BASE_DIR / "facwe detection"

# --- Deployment configuration (all optional, see .env.example) -------------
# CORS_ORIGINS: comma separated list of browser origins allowed to call this API
# ML_API_KEY:   if set, every request except /health must send "X-API-Key: <key>"
DEFAULT_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
CORS_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.environ.get("CORS_ORIGINS", "").split(",")
    if o.strip()
] or DEFAULT_ORIGINS
ML_API_KEY = os.environ.get("ML_API_KEY", "")

def require_api_key(x_api_key: str = Header(default="")):
    if ML_API_KEY and x_api_key != ML_API_KEY:
        raise HTTPException(401, "Invalid or missing API key")


app = FastAPI(title="SmartRecruit ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

face_model = joblib.load(FACE_DIR / "best_face_activity_model.pkl")
# Class IDs used by best_face_activity_model.pkl were encoded in this order.
# Keeping the string map in source avoids loading a LabelEncoder pickle created
# with a different scikit-learn version during inference.
FACE_LABELS = [
    "LOOKING_AWAY",
    "LOOKING_LEFT",
    "LOOKING_RIGHT",
    "MULTIPLE_FACES",
    "NORMAL",
    "NO_FACE",
]

FACE_FEATURES = [
    "face_presence_percent",
    "maximum_faces_detected",
    "longest_face_absence_sec",
    "multiple_face_duration_sec",
    "looking_away_events",
    "looking_center_percent",
    "looking_left_percent",
    "looking_right_percent",
]


class FaceMetrics(BaseModel):
    face_presence_percent: float = Field(ge=0, le=100)
    maximum_faces_detected: int = Field(ge=0)
    longest_face_absence_sec: float = Field(ge=0)
    multiple_face_duration_sec: float = Field(ge=0)
    looking_away_events: int = Field(ge=0)
    looking_center_percent: float = Field(ge=0, le=100)
    looking_left_percent: float = Field(ge=0, le=100)
    looking_right_percent: float = Field(ge=0, le=100)


@app.get("/health")
def health():
    return {"status": "ok", "service": "SmartRecruit ML"}


@app.post("/interview/generate", dependencies=[Depends(require_api_key)])
async def generate_interview(
    resume: UploadFile = File(...),
    github_username: str = Form(...)
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Upload a PDF resume")

    if not github_username.strip():
        raise HTTPException(400, "GitHub username is required")

    if "/" in github_username or "\\" in github_username:
        raise HTTPException(400, "Invalid GitHub username")

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            work_dir = Path(temp_dir)
            resume_path = work_dir / "resume.pdf"

            resume_bytes = await resume.read()

            if not resume_bytes:
                raise HTTPException(400, "Resume file is empty")

            resume_path.write_bytes(resume_bytes)

            env = os.environ.copy()
            env["GITHUB_USERNAME"] = github_username.strip()

            subprocess.run(
                [sys.executable, str(BASE_DIR / "final_candidate_profile.py")],
                cwd=work_dir,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                timeout=300
            )

            subprocess.run(
                [sys.executable, str(BASE_DIR / "question_generator.py")],
                cwd=work_dir,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                timeout=300
            )

            profile_path = work_dir / "candidate_profile.json"
            questions_path = work_dir / "questions.json"

            if not profile_path.exists() or not questions_path.exists():
                raise RuntimeError("Profile or questions output was not created")

            profile = json.loads(profile_path.read_text(encoding="utf-8"))
            questions = json.loads(questions_path.read_text(encoding="utf-8"))

            return {
                "candidate_profile": profile,
                "interview": questions
            }

    except subprocess.TimeoutExpired:
        raise HTTPException(504, "ML processing timed out")
    except subprocess.CalledProcessError as exc:
        print("ML script failed:", exc.stderr[-4000:])
        raise HTTPException(502, "Resume analysis or question generation failed")
    except HTTPException:
        raise
    except Exception as exc:
        print("Interview generation failed:", str(exc))
        raise HTTPException(500, "Interview generation failed")


@app.post("/predict-job", dependencies=[Depends(require_api_key)])
async def predict_job(resume: UploadFile = File(...)):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Upload a PDF resume")

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            pdf_path = Path(temp_dir) / "resume.pdf"
            pdf_path.write_bytes(await resume.read())

            prediction = predict_job_from_pdf(str(pdf_path))

            return {"predicted_job_role": prediction}

    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception as exc:
        print("Job prediction failed:", str(exc))
        raise HTTPException(500, "Job prediction failed")


@app.post("/predict-face-activity", dependencies=[Depends(require_api_key)])
def predict_face_activity(metrics: FaceMetrics):
    values = metrics.model_dump()
    features = [[values[name] for name in FACE_FEATURES]]

    # XGBoost was trained on integer-encoded labels. Always decode those IDs
    # to the labels used by the frontend rather than returning "0", "1", etc.
    raw_prediction = face_model.predict(features)[0]
    try:
        label_index = int(raw_prediction)
        prediction = FACE_LABELS[label_index] if 0 <= label_index < len(FACE_LABELS) else str(raw_prediction)
    except (TypeError, ValueError, AttributeError, IndexError):
        prediction = str(raw_prediction)

    confidence = 0.0
    if hasattr(face_model, "predict_proba"):
        probabilities = face_model.predict_proba(features)[0]
        if len(probabilities):
            confidence = round(float(max(probabilities)), 4)

    return {
        "predicted_activity": str(prediction),
        "confidence": confidence,
    }


if __name__ == "__main__":
    # `python main.py` works locally and on hosts that provide $PORT (Render, Railway, ...)
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "8000")),
    )
