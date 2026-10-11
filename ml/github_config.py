import os

# The token is read from the environment (or ml/.env) - never hard-code it here.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Optional: without a token GitHub allows only 60 requests/hour.
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
