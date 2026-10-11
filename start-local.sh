#!/usr/bin/env bash
# One command: starts MongoDB (via Docker if needed), ML (8000), backend (3500), frontend (5173).
# Needs: Node 20+, Python 3.10-3.13, and either MongoDB running locally or Docker.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- config files (already included; recreated from examples only if missing)
for d in ml backend frontend; do
  [ -f "$ROOT/$d/.env" ] || cp "$ROOT/$d/.env.example" "$ROOT/$d/.env"
done

# --- pick a Python that works with the pinned scikit-learn (3.10-3.13)
PY=""
for c in python3.12 python3.11 python3.13 python3.10 python3; do
  if command -v $c >/dev/null 2>&1 && $c -c 'import sys;sys.exit(0 if (3,10)<=sys.version_info[:2]<=(3,13) else 1)'; then PY=$c; break; fi
done
[ -n "$PY" ] || { echo "Need Python 3.10-3.13 (found none)."; exit 1; }

# --- MongoDB
if ! (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
  if command -v docker >/dev/null 2>&1; then
    echo ">> Starting MongoDB in Docker..."
    docker start smartrecruit-mongo >/dev/null 2>&1 || docker run -d --name smartrecruit-mongo -p 27017:27017 mongo:7 >/dev/null
    sleep 4
  else
    echo "!! MongoDB is not running on 127.0.0.1:27017 and Docker is not installed."
    echo "   Start MongoDB, or put a MongoDB Atlas URI in backend/.env (MONGO_URI)."
    exit 1
  fi
fi

# --- dependencies (first run only)
if [ ! -d "$ROOT/ml/.venv" ]; then
  $PY -m venv "$ROOT/ml/.venv"
  "$ROOT/ml/.venv/bin/pip" install -r "$ROOT/ml/requirements.txt"
fi
[ -d "$ROOT/backend/node_modules" ]  || (cd "$ROOT/backend"  && npm install)
[ -d "$ROOT/frontend/node_modules" ] || (cd "$ROOT/frontend" && npm install)

echo ">> Open http://localhost:5173   (OTP codes are printed in this terminal)"
trap 'kill 0' EXIT
(cd "$ROOT/ml"       && .venv/bin/python main.py) &
(cd "$ROOT/backend"  && npm run dev) &
(cd "$ROOT/frontend" && npm run dev) &
wait
