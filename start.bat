@echo off
title ClubConnect - Setup & Launch
color 0A

echo.
echo  ============================================================
echo    ClubConnect ^| College Event Management System
echo    DAA-T160 ^| Heap Top-K ^| KMP Search ^| Greedy Scheduling
echo  ============================================================
echo.

:: ── Step 1: Find Python ──────────────────────────────────────────────────────
echo  [Step 1/5] Locating Python...

set PYTHON=
for %%P in (
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python314\python.exe"
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe"
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe"
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe"
    "C:\Python314\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
) do (
    if exist %%P (
        set PYTHON=%%~P
        goto :found_python
    )
)

:: Fallback: try python from PATH
where python >nul 2>&1
if %errorlevel%==0 (
    set PYTHON=python
    goto :found_python
)

echo.
echo  [ERROR] Python not found. Please install Python 3.11+ from https://python.org
echo.
pause
exit /b 1

:found_python
echo  Found Python: %PYTHON%
echo.

:: ── Step 2: Create virtual environment ───────────────────────────────────────
echo  [Step 2/5] Setting up virtual environment...

if not exist ".venv" (
    echo  Creating .venv...
    "%PYTHON%" -m venv .venv
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo  Virtual environment created.
) else (
    echo  Virtual environment already exists, skipping.
)
echo.

:: ── Step 3: Install Python dependencies ──────────────────────────────────────
echo  [Step 3/5] Installing Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip --quiet
.venv\Scripts\pip.exe install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to install Python packages.
    pause
    exit /b 1
)
echo  Python dependencies ready.
echo.

:: ── Step 4: Install Node dependencies ────────────────────────────────────────
echo  [Step 4/5] Installing frontend dependencies...

if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed. Make sure Node.js is installed.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo  Frontend dependencies installed.
) else (
    echo  node_modules already exists, skipping.
)
echo.

:: ── Step 5: Launch both servers ───────────────────────────────────────────────
echo  [Step 5/5] Launching servers...
echo.

start "ClubConnect ^| Backend (port 8000)" cmd /k ^
    "title ClubConnect Backend && echo. && echo  Backend running at http://127.0.0.1:8000 && echo  Press Ctrl+C to stop. && echo. && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "ClubConnect ^| Frontend (port 5173)" cmd /k ^
    "title ClubConnect Frontend && echo. && echo  Frontend running at http://localhost:5173 && echo  Press Ctrl+C to stop. && echo. && cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

:: Open browser
start http://localhost:5173

:: ── Done ─────────────────────────────────────────────────────────────────────
echo.
echo  ============================================================
echo    Everything is running!
echo.
echo    Frontend  ->  http://localhost:5173
echo    Backend   ->  http://127.0.0.1:8000
echo    API Docs  ->  http://127.0.0.1:8000/docs
echo.
echo    Demo Credentials:
echo      Student   : aarav@student.edu   / pass123
echo      Moderator : priya@college.edu   / mod123
echo.
echo    Close the two server windows to stop the project.
echo  ============================================================
echo.
pause
