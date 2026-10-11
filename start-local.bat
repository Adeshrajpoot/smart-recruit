@echo off
REM One command: MongoDB (Docker if needed), ML (8000), backend (3500), frontend (5173).
REM Needs: Node 20+, Python 3.10-3.13 (use the "py" launcher), and MongoDB running locally or Docker.
set ROOT=%~dp0
for %%D in (ml backend frontend) do (
  if not exist "%ROOT%%%D\.env" copy "%ROOT%%%D\.env.example" "%ROOT%%%D\.env" >nul
)

powershell -NoProfile -Command "try{(New-Object Net.Sockets.TcpClient('127.0.0.1',27017)).Close();exit 0}catch{exit 1}"
if errorlevel 1 (
  where docker >nul 2>nul
  if errorlevel 1 (
    echo MongoDB is not running on 127.0.0.1:27017 and Docker is not installed.
    echo Start MongoDB, or put a MongoDB Atlas URI in backend\.env ^(MONGO_URI^).
    pause & exit /b 1
  )
  echo Starting MongoDB in Docker...
  docker start smartrecruit-mongo >nul 2>nul || docker run -d --name smartrecruit-mongo -p 27017:27017 mongo:7
  timeout /t 5 >nul
)

if not exist "%ROOT%ml\.venv" (
  py -3.12 -m venv "%ROOT%ml\.venv" 2>nul || py -3.11 -m venv "%ROOT%ml\.venv" 2>nul || py -3.13 -m venv "%ROOT%ml\.venv" 2>nul || python -m venv "%ROOT%ml\.venv"
  "%ROOT%ml\.venv\Scripts\pip" install -r "%ROOT%ml\requirements.txt"
)
if not exist "%ROOT%backend\node_modules"  (cd /d "%ROOT%backend"  && call npm install)
if not exist "%ROOT%frontend\node_modules" (cd /d "%ROOT%frontend" && call npm install)

start "ML"       cmd /k "cd /d %ROOT%ml && .venv\Scripts\python main.py"
start "Backend"  cmd /k "cd /d %ROOT%backend && npm run dev"
start "Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"
echo Open http://localhost:5173  (OTP codes are printed in the Backend window)
