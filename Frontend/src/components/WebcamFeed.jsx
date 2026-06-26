import { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamFeed = ({ websocket, onFrameSent, isConnected }) => {
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Calculate video constraints for optimal performance
  const videoConstraints = {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  };

  /**
   * Capture frame from webcam and convert to base64
   */
  const captureFrame = useCallback(() => {
    if (!webcamRef.current || !isCameraReady || !isConnected) {
      return;
    }

    try {
      // Get the canvas element from webcam
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        console.warn('Failed to capture frame');
        return;
      }

      if (websocket && isConnected) {
        websocket.sendFrame(imageSrc);
      }

      frameCountRef.current += 1;

      if (onFrameSent) {
        onFrameSent({
          frameData: imageSrc,
          frameCount: frameCountRef.current,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }, [isCameraReady, isConnected, websocket, onFrameSent]);

  /**
   * Start capturing frames at regular intervals
   */
  const startCapture = useCallback(() => {
    // Capture frame every 50ms (10 FPS)
    captureIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 50);
  }, [captureFrame]);

  /**
   * Stop capturing frames
   */
  const stopCapture = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle when webcam is ready
   */
  const handleUserMediaReady = useCallback(() => {
    setIsCameraReady(true);
    if (isConnected) {
      startCapture();
    }
  }, [isConnected, startCapture]);

  /**
   * Effect: Start/stop capture based on WebSocket connection
   */
  useEffect(() => {
    if (isConnected && isCameraReady) {
      startCapture();
    } else {
      stopCapture();
    }

    return () => {
      stopCapture();
    };
  }, [isConnected, isCameraReady, startCapture, stopCapture]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCapture();
      const stream = webcamRef.current?.video?.srcObject;

      if (stream instanceof MediaStream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopCapture]);

  return (
    <div className="webcam-feed-container">
      <div className="webcam-wrapper">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMediaReady}
          onUserMediaError={(error) => {
            console.error('Webcam error:', error);
            setIsCameraReady(false);
          }}
          className="webcam-video"
        />
      </div>

      {/* Info message */}
      {!isConnected && (
        <div className="info-message warning">
          Waiting for WebSocket connection...
        </div>
      )}

      {!isCameraReady && (
        <div className="info-message info">
          Initializing camera...
        </div>
      )}

      <style>{`
        .webcam-feed-container {
          width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .webcam-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: #000;
        }

        .webcam-video {
          width: 100%;
          max-height: 500px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .info-message {
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          text-align: center;
        }

        .info-message.warning {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }

        .info-message.info {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
        
        .right-column {
        max-height: calc(100vh - 180px);
        overflow-y: auto;
        }

      `}</style>
    </div>
  );
};

export default WebcamFeed;
