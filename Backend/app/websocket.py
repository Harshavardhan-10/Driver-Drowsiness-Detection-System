import json
import logging
import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .detector import DrowsinessDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router for WebSocket endpoints
router = APIRouter()

# Global detector instance
frame_detector = DrowsinessDetector()


@router.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    """
    WebSocket endpoint for real-time drowsiness detection.
    
    Protocol:
    - Client sends base64 encoded image frames
    - Server processes frames and returns detection results
    - Connection closes on client disconnect or error
    
    Response format:
    {
        "ear": float (Eye Aspect Ratio),
        "mar": float (Mouth Aspect Ratio),
        "score": int (0-100),
        "status": str (NORMAL, WARNING, DROWSY),
        "yawns": int
    }
    detection_result 
    """
    await websocket.accept()
    logger.info("WebSocket client connected")
    
    try:
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()
            
            try:
                # Parse received data
                frame_message = json.loads(data)
                frame_data = frame_message.get("frame")
                
                if not frame_data:
                    await websocket.send_json({
                        "error": "No frame data provided"
                    })
                    continue
                
                # Process frame through detector
                detection_result = frame_detector.process_frame(frame_data)
                
                # Send detection results back to client
                await websocket.send_json(detection_result)
            
            except json.JSONDecodeError:
                logger.error("Failed to parse JSON from client")
                await websocket.send_json({
                    "error": "Invalid JSON format"
                })
            
            except Exception as e:
                logger.error(f"Error processing frame: {e}")
                await websocket.send_json({
                    "error": f"Error processing frame: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    
    finally:
        # Cleanup on disconnect
        try:
            await websocket.close()
        except:
            pass


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    Alternative WebSocket endpoint for streaming raw frame data.
    
    Accepts binary frame data directly without JSON wrapper.
    """
    await websocket.accept()
    logger.info("WebSocket stream client connected")
    
    try:
        while True:
            # Receive binary frame data
            data = await websocket.receive_bytes()
            
            try:
                np_arr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if frame is None:
                    await websocket.send_json({
                        "face_detected": False,
                        "error": "Unable to decode frame"
                    })
                    continue

                detection_result = frame_detector.analyze_frame(frame)
                
                await websocket.send_json(detection_result)
            
            except Exception as e:
                logger.error(f"Error processing frame data: {e}")
                await websocket.send_json({
                    "error": f"Error processing frame: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info("WebSocket stream client disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket stream error: {e}")
    
    finally:
        # Cleanup on disconnect
        try:
            await websocket.close()
        except:
            pass


@router.get("/detector/state")
async def get_detector_state():
    """
    Get current detector state (for debugging/monitoring).
    
    Returns:
        Dictionary with detector metrics
    """
    return frame_detector.get_detector_state()


@router.post("/detector/reset")
async def reset_detector():
    """
    Reset detector state and counters.
    
    Returns:
        Confirmation message
    """
    frame_detector.reset()
    logger.info("Detector state reset")
    return {"message": "Detector reset successfully"}

@router.post("/detector/dismiss")
async def dismiss_alert():

    frame_detector.dismiss_alert()

    return {
        "message": "Alert dismissed"
    }
