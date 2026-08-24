#  Driver Drowsiness Detection System

A real-time driver drowsiness detection system using computer vision and facial landmark analysis. The system captures video from a webcam, processes frames using MediaPipe Face Mesh, and detects signs of drowsiness through Eye Aspect Ratio (EAR) and Mouth Aspect Ratio (MAR) calculations.

##  Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Methods Used](#methods-used)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)
- [WebSocket Protocol](#websocket-protocol)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

##  Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - High-performance web framework
- **MediaPipe** - Facial landmark detection
- **OpenCV** - Image processing
- **WebSocket** - Real-time communication
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **react-webcam** - Camera access
- **react-router-dom** - Client-side routing
- **lucide-react** - Icon library

##  Features

- **Real-time Eye Closure Detection** - Monitors Eye Aspect Ratio (EAR) to detect closed eyes
- **Yawn Detection** - Detects yawning via Mouth Aspect Ratio (MAR)
- **Drowsiness Scoring** - 0-100 score based on eye closure duration and yawn frequency
- **Three Alert Levels** - NORMAL → WARNING → DROWSY
- **Audio Alarms** - Plays alarm sound when drowsiness is detected
- **Live Landmark Overlay** - Outlines the exact eye and mouth landmark points used for EAR/MAR directly on the live camera feed
- **Live Dashboard** - Real-time display of EAR, MAR, score, status, and yawn count
- **Automatic Reconnection** - WebSocket auto-reconnects on connection loss

## Project Structure

```
Drowsiness_Detection/
├── Backend/
│   ├── app/
│   │   ├── config.py          # Thresholds and configuration constants
│   │   ├── detector.py         # Main detector (MediaPipe Face Mesh wrapper)
│   │   ├── drowsiness.py      # Drowsiness detection state machine
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── utils.py           # EAR and MAR calculation utilities
│   │   └── websocket.py       # WebSocket endpoints
│   ├── .venv/                 # Python virtual environment
│   └── requirements.txt       # Python dependencies
├── Frontend/
│   ├── public/
│   │   ├── alarm.mp3           # Alarm sound file
│   │   └── research-paper.pdf  # Research paper (placeholder - replace with your own)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBox.jsx    # Drowsiness alert overlay with alarm
│   │   │   ├── Dashboard.jsx   # Real-time metrics display
│   │   │   ├── StatsPanel.jsx  # Session statistics
│   │   │   └── WebcamFeed.jsx  # Webcam capture and frame sending
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   └── Monitor.jsx     # Main monitoring page
│   │   ├── services/
│   │   │   └── websocket.js    # WebSocket client service
│   │   ├── App.jsx             # Root component with routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

##  Methods Used

### Eye Aspect Ratio (EAR)

EAR is used to detect whether the eyes are open or closed. It is calculated from 6 facial landmarks around each eye:

```
EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|)
```

Where:
- `p1, p4` = eye corner points (horizontal)
- `p2, p3, p5, p6` = eye top/bottom points (vertical)

The EAR is relatively constant when the eye is open and decreases sharply when the eye closes. Values are averaged between left and right eyes.

**Threshold:** EAR < 0.25 → eye considered closed

### Mouth Aspect Ratio (MAR)

MAR detects yawning by measuring the openness of the mouth:

```
MAR = vertical_distance / horizontal_distance
```

Where:
- `vertical_distance` = distance between top and bottom lip landmarks
- `horizontal_distance` = distance between mouth corner landmarks

**Threshold:** MAR > 0.75 → yawning detected

### Drowsiness Scoring Algorithm

The system uses a cumulative scoring mechanism:

1. **Eye Closure Score**: Tracks consecutive frames with EAR below threshold. After 30 frames of closure, the score increases by 1 per additional frame.

2. **Yawn Score**: Each unique yawn adds 2 points to the score.

3. **Total Score**: eye_score + yawn_score, capped at 100.

4. **Status Levels**:
   - **NORMAL** (score < 30)
   - **WARNING** (30 ≤ score < 60)
   - **DROWSY** (score ≥ 60) → triggers alert with alarm

### Face Mesh Landmarks

Uses MediaPipe Face Mesh with 468 facial landmarks. Key landmark indices:
- **Left eye**: 33, 160, 158, 133, 153, 144
- **Right eye**: 362, 385, 387, 263, 373, 380
- **Mouth**: 13, 14, 78, 308, 82, 312

## Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **npm** 9 or higher
- **Webcam** connected to your system

##  Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate    # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Step 1: Start the Backend Server

```bash
cd Backend
.venv\Scripts\activate   # Windows
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Step 2: Start the Frontend

In a new terminal:
```bash
cd Frontend
npm run dev
```

The frontend starts at `http://localhost:5173` (default Vite port).

### Step 3: Use the Application

1. Open `http://localhost:5173` in your browser
2. Click **"Start Detection"** on the home page
3. Grant camera permission when prompted
4. The monitoring console will display real-time metrics:
   - **EAR**: Eye Aspect Ratio
   - **MAR**: Mouth Aspect Ratio
   - **Score**: Drowsiness score (0-100)
   - **Status**: NORMAL / WARNING / DROWSY
   - **Yawn Count**: Number of yawns detected
   - The eye and mouth landmarks used for these metrics are outlined live on the camera feed
5. An alert box with an audio alarm triggers when the status reaches **DROWSY**

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and available endpoints |
| GET | `/health` | Health check |
| GET | `/detector/state` | Get current detector state |
| POST | `/detector/reset` | Reset all detector counters |
| POST | `/detector/dismiss` | Dismiss current alert |
| WS | `/ws/detect` | WebSocket for JSON frame detection |
| WS | `/ws/stream` | WebSocket for binary frame streaming |

##  WebSocket Protocol

### `/ws/detect` Endpoint

**Client → Server:**
```json
{
  "frame": "base64_encoded_image_data",
  "timestamp": 1700000000000
}
```

**Server → Client:**
```json
{
  "face_detected": true,
  "ear": 0.25,
  "mar": 0.45,
  "score": 45,
  "status": "WARNING",
  "yawns": 2,
  "alert": false,
  "blink": false,
  "yawn": false,
  "overlay": {
    "left_eye":  [[0.31, 0.42], ...],
    "right_eye": [[0.68, 0.41], ...],
    "mouth":     [[0.49, 0.61], ...]
  }
}
```

The `overlay` field contains the normalized (0-1) coordinates of the exact landmarks used for EAR/MAR, so the frontend can outline eyes and mouth on the live feed.

##  Configuration

All thresholds are in `Backend/app/config.py`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `EAR_THRESHOLD` | 0.25 | EAR below this = eye closed |
| `MAR_THRESHOLD` | 0.75 | MAR above this = yawning |
| `WARNING_FRAMES` | 25 | Consecutive closed frames for WARNING |
| `DROWSY_FRAMES` | 30 | Consecutive closed frames for DROWSY |
| `FPS` | 20 | Target processing FPS |

##  Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed
- Ensure virtual environment is activated
- Check port 8000 is not in use

### Webcam not working
- Ensure browser has camera permission
- Close other apps using the camera
- Check webcam drivers

### Frontend can't connect to backend
- Ensure backend server is running on port 8000
- No CORS issues with the default setup
- Check firewall settings

### WebSocket disconnects
- The service auto-reconnects up to 5 times
- Check backend logs for errors
- Ensure stable network connection
