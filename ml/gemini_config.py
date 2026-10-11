import os

# The key is read from the environment (or ml/.env) - never hard-code it here.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Add it to ml/.env (see .env.example) "
        "or to your hosting provider's environment variables."
    )
