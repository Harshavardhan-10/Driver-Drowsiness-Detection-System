import { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

// Video constraints for optimal capture performance
const VIDEO_CONSTRAINTS = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user'
};

const WebcamFeed = ({ websocket, onFrameSent, isConnected, detection }) => {
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const videoSizeRef = useRef({ width: 0, height: 0 });
  const [isCameraReady, setIsCameraReady] = useState(false);

  /**
   * Draw detection landmark points and outlines over the live feed.
   *
   * Landmarks arrive normalized (0-1) from the backend. The video is
   * rendered with object-fit: cover, so coordinates are mapped through
   * the cover transform before drawing.
   */
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const overlay = detection?.overlay;
    if (!overlay) return;

    // Intrinsic source frame size (falls back to ideal constraints)
    const srcWidth = videoSizeRef.current.width || VIDEO_CONSTRAINTS.width.ideal;
    const srcHeight = videoSizeRef.current.height || VIDEO_CONSTRAINTS.height.ideal;
    if (!srcWidth || !srcHeight) return;

    const dispWidth = wrapper.clientWidth;
    const dispHeight = wrapper.clientHeight;
    if (!dispWidth || !dispHeight) return;

    // object-fit: cover mapping
    const scale = Math.max(dispWidth / srcWidth, dispHeight / srcHeight);
    const offsetX = (dispWidth - srcWidth * scale) / 2;
    const offsetY = (dispHeight - srcHeight * scale) / 2;

    const toDisplay = ([nx, ny]) => [
      nx * srcWidth * scale + offsetX,
      ny * srcHeight * scale + offsetY,
    ];

    const eyesOpen = (detection.ear ?? 0) >= 0.25;
    const notYawning = (detection.mar ?? 0) <= 0.75;
    const eyeColor = eyesOpen ? '#34d399' : '#fb7185';
    const mouthColor = notYawning ? '#22d3ee' : '#fbbf24';

    const drawGroup = (points, color) => {
      if (!Array.isArray(points) || points.length === 0) return;

      const pts = points.map(toDisplay);

      // Outline polygon through all landmarks used for the metric
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Individual landmark markers
      pts.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    drawGroup(overlay.left_eye, eyeColor);
    drawGroup(overlay.right_eye, eyeColor);
    drawGroup(overlay.mouth, mouthColor);
  }, [detection]);

  // Redraw whenever new detection results arrive (~10 FPS)
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Keep canvas backing store in sync with displayed size
  useEffect(() => {
    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;

      const dpr = window.devicePixelRatio || 1;
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      if (!width || !height) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOverlay();
    };

    syncCanvasSize();

    if (!('ResizeObserver' in window)) return undefined;

    const observer = new ResizeObserver(syncCanvasSize);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isCameraReady, drawOverlay]);

  // Track intrinsic frame size once metadata is available
  useEffect(() => {
    if (!isCameraReady) return undefined;

    const updateVideoSize = () => {
      const videoEl = webcamRef.current?.video;
      if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
        videoSizeRef.current = {
          width: videoEl.videoWidth,
          height: videoEl.videoHeight,
        };
      }
    };

    updateVideoSize();
    const videoEl = webcamRef.current?.video;
    videoEl?.addEventListener('loadedmetadata', updateVideoSize);
    return () => videoEl?.removeEventListener('loadedmetadata', updateVideoSize);
  }, [isCameraReady]);

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
      <div className="webcam-wrapper" ref={wrapperRef}>
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={VIDEO_CONSTRAINTS}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMediaReady}
          onUserMediaError={(error) => {
            console.error('Webcam error:', error);
            setIsCameraReady(false);
          }}
          className="webcam-video"
        />
        {/* Landmark overlay (eyes / mouth points used for detection) */}
        <canvas
          ref={canvasRef}
          className="webcam-overlay"
          aria-hidden="true"
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

        .webcam-overlay {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
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
