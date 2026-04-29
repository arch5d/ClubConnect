# How to Run ClubConnect

**ClubConnect** is a full-stack College Event Management System built with FastAPI (Python) on the backend and React + Vite on the frontend.

---

## Prerequisites

Before running the project, make sure you have the following installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11 or higher | https://www.python.org/downloads/ |
| Node.js | 18 or higher | https://nodejs.org/ |
| npm | comes with Node.js | — |

> **Tip:** During Python installation on Windows, check the box that says **"Add Python to PATH"**.

---

## Option 1 — One-Click Setup (Recommended)

This is the easiest way. A single batch file handles everything automatically.

### Steps

1. Open the project folder in File Explorer
2. Double-click **`start.bat`**
3. Wait — it will automatically:
   - Find your Python installation
   - Create a virtual environment (`.venv`)
   - Install all Python packages from `requirements.txt`
   - Install all frontend Node packages
   - Start the backend server
   - Start the frontend server
   - Open the browser at `http://localhost:5173`

> On the **first run** it may take 1–2 minutes to install dependencies. Subsequent runs are instant.

### What you'll see

Two terminal windows will open:

- **ClubConnect Backend** — running at `http://127.0.0.1:8000`
- **ClubConnect Frontend** — running at `http://localhost:5173`

Your browser will open automatically. If it doesn't, navigate to `http://localhost:5173` manually.

### To stop the project

Close both terminal windows.

---

## Option 2 — Manual Setup (Step by Step)

Use this if the batch file doesn't work or you prefer full control.

### Step 1 — Clone / Download the project

Make sure you are in the project root folder (the one containing `start.bat`, `requirements.txt`, and the `app/` folder).

### Step 2 — Create a Python virtual environment

Open a terminal in the project root and run:

```bash
python -m venv .venv
```

### Step 3 — Activate the virtual environment

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

You should see `(.venv)` appear at the start of your terminal prompt.

### Step 4 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 5 — Start the backend server

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Leave this terminal open. You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 6 — Install frontend dependencies

Open a **second terminal** in the project root:

```bash
cd frontend
npm install
```

### Step 7 — Start the frontend server

Still inside the `frontend/` folder:

```bash
npm run dev
```

You should see:

```
VITE ready in ...ms
➜  Local:   http://localhost:5173/
```

### Step 8 — Open the app

Navigate to **http://localhost:5173** in your browser.

---

## Demo Credentials

Use these to log in and explore the system:

### Student Accounts

| Name | Email | Password |
|------|-------|----------|
| Aarav Mehta | aarav@student.edu | pass123 |
| Sneha Patel | sneha@student.edu | pass456 |
| Rohan Verma | rohan@student.edu | pass789 |

### Moderator Accounts

| Name | Email | Password |
|------|-------|----------|
| Dr. Priya Sharma | priya@college.edu | mod123 |
| Prof. Arjun Nair | arjun@college.edu | mod456 |

---

## Project URLs

| Service | URL |
|---------|-----|
| Frontend (React app) | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000 |
| Interactive API Docs (Swagger) | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/health |

---

## Project Structure

```
ClubConnect/
│
├── start.bat                  ← One-click launcher (Windows)
├── requirements.txt           ← Python dependencies
├── HOWTORUN.md                ← This file
│
├── app/                       ← FastAPI backend
│   ├── main.py                ← API routes + demo seed data
│   ├── models/
│   │   ├── schemas.py         ← Pydantic data models
│   │   └── enums.py           ← Skill, Goal, Scope enums
│   └── services/
│       ├── matching_engine.py ← Heap Top-K + Greedy algorithm
│       ├── search_provider.py ← KMP + Rabin-Karp search
│       ├── student_service.py ← Student logic
│       ├── moderator_service.py
│       └── persistence.py     ← JSON file-based storage
│
├── frontend/                  ← React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            ← Root component + routing
│   │   ├── constants.js       ← Shared constants + helpers
│   │   └── components/
│   │       ├── LoginPage.jsx
│   │       ├── StudentDashboard.jsx
│   │       ├── StudentProfilePage.jsx
│   │       ├── ModeratorDashboard.jsx
│   │       ├── ClubsPage.jsx
│   │       ├── EventCard.jsx
│   │       └── ui.jsx         ← Shared UI components
│   └── package.json
│
└── data/                      ← Auto-created on first run
    ├── students.json
    ├── moderators.json
    ├── clubs.json
    └── events.json
```

---

## Data Persistence

All data is stored as JSON files in the `data/` folder, which is created automatically on first run. This means:

- Students, moderators, clubs, and events **survive server restarts**
- Demo data is seeded automatically the **first time** the backend starts
- To reset to demo data, delete the `data/` folder and restart the backend

---

## Algorithms Used (DAA-T160)

| Algorithm | Location | Complexity | Purpose |
|-----------|----------|------------|---------|
| KMP String Search | `search_provider.py` | O(n + m) | Event search by title/description |
| Rabin-Karp Search | `search_provider.py` | O(n + m) avg | Alternative search algorithm |
| Heap-based Top-K | `matching_engine.py` | O(n log k) | Personalised event recommendations |
| Greedy Scheduling | `matching_engine.py` | O(r) | Non-conflicting time slot selection |
| BFS Analytics | `moderator_service.py` | O(V + E) | Club relationship graph traversal |

---

## Troubleshooting

**`python` not found**
- Make sure Python is installed and added to PATH
- Try `python3` instead of `python`
- On Windows, reinstall Python and check "Add to PATH"

**`npm` not found**
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

**Port already in use**
- Backend (8000): kill the process using port 8000 or change the port in `start.bat`
- Frontend (5173): Vite will automatically try the next available port

**PowerShell script execution error**
- Run `start.bat` using Command Prompt (cmd), not PowerShell
- Or right-click `start.bat` → "Run as administrator"

**Backend starts but frontend shows no data**
- Make sure the backend is running at `http://127.0.0.1:8000`
- Check `http://127.0.0.1:8000/health` in your browser — it should return `{"status":"ok"}`
- Check that CORS is not blocked (use Chrome or Firefox)
