# Deploy to Render (free)

## Free-stack overview

| Piece | Where | Cost |
|---|---|---|
| Frontend (static) | Render static site `drowsiness-web` | free, forever, always on |
| API (FastAPI + MediaPipe) | Render free web service `drowsiness-api` | free, forever (spins down after 15 min idle, cold start ~60s) |

> **Watch out:** the free tier has only ~512 MB disk and 0.1 CPU. MediaPipe +
> OpenCV is a heavy install (~500 MB) and per-frame detection is slow, so the
> live feed works but lags. Consider a paid Render instance (e.g. Starter) for
> smooth real-time use.

## 1. Push this project to GitHub

```bash
cd Drowsiness_Detection
git init
git add .
git commit -m "Initial commit"
gh auth login              # one-time GitHub login
gh repo create <your-name>/driver-drowsiness-detection --private --source=. --push
```

## 2. Create the Render Blueprint

1. https://render.com -> **New -> Blueprint** -> connect your GitHub repo
2. Render reads `render.yaml` and creates two free resources:

| Resource | Type | URL |
|---|---|---|
| `drowsiness-api` | Web service (free) | https://drowsiness-api-o7ju.onrender.com |
| `drowsiness-web` | Static site (free) | https://drowsiness-web.onrender.com |

The blueprint already wires the pieces together:
- `drowsiness-api` runs `uvicorn app.main:app` with `CORS_ORIGINS` set to the
  deployed frontend URL.
- `drowsiness-web` is built with `VITE_API_URL` pointing at the deployed API,
  so the WebSocket client connects over `wss://` automatically.

## 3. Done

Open https://drowsiness-web.onrender.com -> **Start Monitoring** -> allow camera
access (camera requires HTTPS, which Render provides).

## Local development (unchanged)

```bash
# Backend
cd Backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000

# Frontend (no VITE_API_URL -> falls back to localhost:8000)
cd Frontend
npm install
npm run dev                            # http://localhost:5173
```