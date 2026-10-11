# RESUME TEXT EXTRACTOR 
import json
import pymupdf
from google import genai
from google.genai import errors
import time

# text is the test of the resume pdf
pdf_path = "resume.pdf"
doc = pymupdf.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()
doc.close()


from gemini_config import GEMINI_API_KEY
api_key = GEMINI_API_KEY

client = genai.Client(api_key=api_key)

prompt = '''You are a resume information extraction system.

Extract structured information ONLY from the resume text provided below.

Rules:
1. Extract only information explicitly stated in the resume.
2. Never invent, infer, or assume information.
3. Follow the exact JSON structure provided.
4. Do not add, remove, rename, or change any fields.
5. If a string value is not present, use "".
6. If a list contains no information, use [].
7. Preserve the original meaning of the resume.
8. Do not include phone numbers, email addresses, LinkedIn URLs,
   physical addresses, or other contact information.
9. Put professional certifications in "certifications".
10. Put awards, honors, hackathon wins, competition results,
    employee awards, and similar achievements in "achievements".
11. Do not classify an award or achievement as a certification.
12. Return ONLY the JSON object. Do not include explanations,
    Markdown, code fences, or additional text.
Required structure:
{
  "resume": {
    "name": "",
    "education": [
      {
        "degree": "",
        "institution": "",
        "start_date": "",
        "end_date": "",
        "cgpa": ""
      }
    ],
    "experience": [
      {
        "role": "",
        "company": "",
        "start_date": "",
        "end_date": "",
        "location": "",
        "achievements": []
      }
    ],
    "skills": [],
    "projects": [
      {
        "name": "",
        "description": "",
        "technologies": [],
        "achievements": []
      }
    ],
    "certifications": [
      {
        "name": "",
        "year": ""
      }
    ],
    "achievements": []
  }
}
Resume text:
''' + text

i = 0
while i == 0:
    try:
        response1 = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )
        i = 1
    except errors.ServerError as e:
        if e.code == 503:
            print("Server busy. Retrying in 15 seconds...")
            time.sleep(15)
    except errors.ClientError as e:
        if e.code == 429:
            print("Rate limit reached. Switching to Gemini 3.6 Flash...")
            response1 = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )
            i = 1
resume_data = json.loads(response1.text) # Here the .text convert response from gemini response object to str in python

with open("resume.json", "w", encoding="utf-8") as file:
    json.dump(
        resume_data,
        file,
        indent=4,
        ensure_ascii=False
    )

# ------------------------------------------------------------------------------------------------------

# GITHUB DATA EXTRACTOR 

import os
import requests
import json
import base64
from pathlib import PurePosixPath
from github_config import GITHUB_TOKEN

username = os.environ.get("GITHUB_USERNAME", "Adeshrajpoot")

headers = {"Accept": "application/vnd.github+json"}
if GITHUB_TOKEN:
    headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

important_files = {
    "README.md", "README.txt", "requirements.txt",
    "pyproject.toml", "package.json", "pom.xml",
    "build.gradle", "Dockerfile"
}

source_extensions = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java",
    ".cpp", ".c", ".h", ".hpp", ".cs", ".go",
    ".rs", ".php", ".rb", ".swift", ".kt", ".kts",
    ".ipynb"
}

ignored_extensions = {
    ".csv", ".pkl", ".pickle", ".zip", ".jpg", ".jpeg",
    ".png", ".gif", ".mp4", ".mp3", ".pdf", ".bin",
    ".pt", ".pth", ".onnx"
}

ignored_directories = {
    ".git", "node_modules", "venv", ".venv", "env",
    "__pycache__", "dist", "build", ".idea",
    ".vscode", "site-packages", "target"
}

repos_url = f"https://api.github.com/users/{username}/repos"

repos = requests.get(
    repos_url,
    headers=headers,
    params={"per_page": 100, "sort": "updated"}
)

repos.raise_for_status()
repos = repos.json()

github_data = {
    "username": username,
    "repositories": []
}

for repo in repos:

    if repo.get("fork") or repo.get("archived"):
        continue

    repo_name = repo["name"]
    branch = repo["default_branch"]

    tree_url = (
        f"https://api.github.com/repos/{username}/"
        f"{repo_name}/git/trees/{branch}?recursive=1"
    )

    tree_response = requests.get(tree_url, headers=headers)
    tree_response.raise_for_status()
    tree = tree_response.json().get("tree", [])

    files = []

    for item in tree:

        if item["type"] != "blob":
            continue

        path = item["path"]
        file = PurePosixPath(path)
        name = file.name
        extension = file.suffix.lower()
        size = item.get("size", 0)

        if any(d in file.parts for d in ignored_directories):
            continue

        if extension in ignored_extensions:
            continue

        if name in important_files and size <= 100_000:
            files.append(path)

        elif extension in source_extensions:
            limit = 2_000_000 if extension == ".ipynb" else 100_000

            if size <= limit:
                files.append(path)

    repository = {
        "name": repo_name,
        "description": repo.get("description"),
        "language": repo.get("language"),
        "topics": repo.get("topics", []),
        "files": []
    }

    for path in files:

        try:
            file_url = (
                f"https://api.github.com/repos/{username}/"
                f"{repo_name}/contents/{path}"
            )

            response = requests.get(file_url, headers=headers)
            response.raise_for_status()
            data = response.json()

            if "content" not in data:
                continue

            content = base64.b64decode(data["content"]).decode(
                "utf-8", errors="ignore"
            )

            if PurePosixPath(path).suffix.lower() == ".ipynb":
                notebook = json.loads(content)
                sections = []

                for cell in notebook.get("cells", []):
                    source = "".join(cell.get("source", [])).strip()

                    if source:
                        sections.append(
                            f"[{cell.get('cell_type', '').upper()}]\n{source}"
                        )

                content = "\n\n".join(sections)

            repository["files"].append({
                "path": path,
                "content": content
            })

        except Exception:
            continue

    github_data["repositories"].append(repository)

with open("github_data.json", "w", encoding="utf-8") as file:
    json.dump(github_data, file, indent=2, ensure_ascii=False)

print(f"Extracted {len(github_data['repositories'])} repositories.")

# --------------------------------------------------------------------------------------------------------------

# CANDIDATE PROFILE

import json
resume_profile = resume_data
github_profile = github_data

resume = resume_profile["resume"]

candidate_profile = {
    "candidate": {
        "resume": resume,
        "github": github_profile
    }
}

with open("candidate_profile.json", "w", encoding="utf-8") as file:
    json.dump(
        candidate_profile,
        file,
        indent=2,
        ensure_ascii=False
    )

print("Candidate profile created successfully.")

# ------------------------------------------------------------------------------------------------------------------