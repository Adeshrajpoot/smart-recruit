import os
import pickle
import pymupdf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "job_predictor.pkl")


def predict_job_from_pdf(pdf_path):
    model = pickle.load(open(MODEL_PATH, "rb"))

    doc = pymupdf.open(pdf_path)
    resume_text = "\n".join(page.get_text() for page in doc)
    doc.close()

    if not resume_text.strip():
        raise ValueError("No readable text found in resume PDF")

    prediction = model.predict([resume_text])

    return str(prediction[0])
