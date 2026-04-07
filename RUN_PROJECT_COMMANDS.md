# ClubConnect Run Commands

Run all commands from project root:
C:\Users\archi\OneDrive\Desktop\Files and Folders\ClubConnect

## 1. Backend Setup (first time)

c:/python313/python.exe -m pip install -r requirements.txt

## 2. Start Backend (Terminal 1)

c:/python313/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Backend URL:
http://127.0.0.1:8000

Health check:
Invoke-RestMethod -Uri http://127.0.0.1:8000/health

## 3. Frontend Setup (first time)

cd frontend
npm install

## 4. Start Frontend (Terminal 2)

cd frontend
npm run dev

Frontend URL:
http://localhost:5173

## 5. Optional: Production Build Test

cd frontend
npm run build

## 6. Stop Servers

In each running terminal, press:
Ctrl + C
