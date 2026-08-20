import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.websocket import router as websocket_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Driver Drowsiness Detection API",
    description="Real-time drowsiness detection system using MediaPipe and FastAPI",
    version="1.0.0"
)

# Enable CORS for the React frontend.
# Comma-separated list, e.g. CORS_ORIGINS=https://drowsiness-web.onrender.com
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
] or default_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register WebSocket routes
app.include_router(websocket_router)


@app.on_event("startup")
async def startup_event():
    """Handle startup events."""
    logger.info("=" * 50)
    logger.info("Driver Drowsiness Detection API Starting")
    logger.info("=" * 50)
    logger.info("WebSocket endpoints available:")
    logger.info("  - ws://localhost:8000/ws/detect (JSON format)")
    logger.info("  - ws://localhost:8000/ws/stream (Binary format)")
    logger.info("REST endpoints available:")
    logger.info("  - GET /health (Health check)")
    logger.info("  - GET /detector/state (Detector state)")
    logger.info("  - POST /detector/reset (Reset detector)")
    logger.info("=" * 50)


@app.on_event("shutdown")
async def shutdown_event():
    """Handle shutdown events."""
    logger.info("Driver Drowsiness Detection API Shutting Down")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with server status
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "Driver Drowsiness Detection API",
            "message": "Server is running and ready to accept connections"
        }
    )


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    
    Returns:
        JSON response with API details
    """
    return {
        "name": "Driver Drowsiness Detection API",
        "version": "1.0.0",
        "description": "Real-time drowsiness detection using MediaPipe Face Mesh",
        "endpoints": {
            "health": "/health",
            "websocket_detect": "/ws/detect",
            "websocket_stream": "/ws/stream",
            "detector_state": "/detector/state",
            "detector_reset": "/detector/reset"
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
