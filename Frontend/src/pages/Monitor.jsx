import { useEffect, useState, useCallback, useRef } from 'react';
import WebcamFeed from '../components/WebcamFeed';
import Dashboard from '../components/Dashboard';
import AlertBox from '../components/AlertBox';
import websocketService from '../services/websocket';

/**
 * Monitor Page
 * 
 * Main monitoring page that combines:
 * - WebcamFeed: Captures and sends video frames
 * - Dashboard: Displays detection metrics
 * - AlertBox: Shows alerts when drowsiness is detected
 * 
 * Manages WebSocket connection and state for real-time detection results.
 */
const Monitor = () => {
  // State for detection metrics
  const [detectionData, setDetectionData] = useState({
    ear: 0,
    mar: 0,
    score: 0,
    status: 'NORMAL',
    yawns: 0,
    alert: false
  });

  // State for connection and UI
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    framesProcessed: 0,
    maxScore: 0,
    startTime: new Date(),
    lastUpdate: new Date()
  });
  const [showAlert, setShowAlert] = useState(false);
  const alertCooldownRef = useRef(false);
  /**
   * Handle incoming detection results from WebSocket
   */
  const handleDetectionResult = useCallback((data) => {
    setDetectionData({
      ear: data.ear || 0,
      mar: data.mar || 0,
      score: data.score || 0,
      status: data.status || "NORMAL",
      yawns: data.yawns || 0,
      alert: data.alert || false
    });

    setSessionStats(prev => ({
      ...prev,
      framesProcessed: prev.framesProcessed + 1,
      maxScore: Math.max(prev.maxScore, data.score || 0),
      lastUpdate: new Date()
    }));

    if (data.alert === true && !alertCooldownRef.current) {
      setShowAlert(true);
    }

    setConnectionError(null);
  }, []);

  /**
   * Handle WebSocket connection errors
   */
  const handleConnectionError = useCallback((error) => {
    console.error('WebSocket error:', error);
    setConnectionError('Connection error. Retrying...');
  }, []);

  /**
   * Handle WebSocket connection open
   */
  const handleConnectionOpen = useCallback(() => {
    console.log('WebSocket connected');
    setIsConnected(true);
    setConnectionError(null);
    setSessionStats(prev => ({
      ...prev,
      startTime: new Date()
    }));
  }, []);

  /**
   * Handle WebSocket connection close
   */
  const handleConnectionClose = useCallback(() => {
    console.log('WebSocket disconnected');
    setIsConnected(false);
  }, []);

  const handleDismissAlert = async () => {

        try {

          await fetch(
            "http://localhost:8000/detector/dismiss",
            {
              method: "POST"
            }
          );

          setDetectionData(prev => ({
            ...prev,
            score: 0,
            status: "NORMAL",
            yawns: 0
          }));

        } catch (error) {

          console.error(error);

        }

      };

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await websocketService.connect(
          '/ws/detect',
          handleDetectionResult,
          handleConnectionError,
          handleConnectionOpen,
          handleConnectionClose
        );
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setConnectionError('Failed to connect to server');
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
    
  }, [handleDetectionResult, handleConnectionError, handleConnectionOpen, handleConnectionClose]);
  
  useEffect(() => {

        const handleUnload = () => {
            websocketService.disconnect();
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };

    }, []);
  /**
   * Calculate session duration
   */
  const getSessionDuration = () => {
    const now = new Date();
    const duration = Math.floor((now - sessionStats.startTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="monitor-page">
      {/* Page Header */}
      <header className="monitor-header">
        <div className="header-content">
          <h1>Driver Drowsiness Detection System</h1>
          <p className="subtitle">Real-time monitoring and alert system</p>
        </div>

        {/* Connection Status Banner */}
        <div className={`connection-banner ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="banner-content">
            <span className="status-indicator"></span>
            <div className="status-info">
              <span className="status-text">
                {isConnected ? 'Connected to Server' : 'Connecting...'}
              </span>
              {connectionError && (
                <span className="error-text">{connectionError}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Alert Box Component */}
      {showAlert && (
      <AlertBox
        status={detectionData.status}
        score={detectionData.score}
        yawns={detectionData.yawns}
        onDismiss={async () => {setShowAlert(false);
          alertCooldownRef.current = true;
          setDetectionData({
            ear: 0,
            mar: 0,
            score: 0,
            status: "NORMAL",
            yawns: 0,
            alert: false
          });

          await fetch("http://localhost:8000/detector/dismiss", {
            method: "POST"
          });
          setTimeout(() => {
            alertCooldownRef.current = false;
          }, 6000);
        }}
      />
      )}

      {/* Main Content */}
      <main className="monitor-content">
        <div className="content-grid">
          {/* Left Column: Webcam Feed */}
          <div className="column left-column">
            <div className="section-card">
              <h2 className="section-title">Live Camera Feed</h2>

            <WebcamFeed
                websocket={websocketService}
                isConnected={isConnected}
            />
            </div>
          </div>

          {/* Right Column: Dashboard and Stats */}
          <div className="column right-column">
            {/* Dashboard Component */}
            <div className="section-card">
            <Dashboard
              ear={detectionData.ear}
              mar={detectionData.mar}
              score={detectionData.score}
              status={detectionData.status}
              yawns={detectionData.yawns}
              isConnected={isConnected}
            />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .monitor-page {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .monitor-header {
          background: rgba(0, 0, 0, 0.2);
          color: white;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          overflow: visible;
        }

        .monitor-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .subtitle {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .connection-banner {
          margin-top: 0.5rem;
          padding: 0.2rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .connection-banner.connected {
          background-color: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
        }

        .connection-banner.disconnected {
          background-color: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        .connection-banner.connected .status-indicator {
          background-color: #10b981;
        }

        .connection-banner.disconnected .status-indicator {
          background-color: #ef4444;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .error-text {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .monitor-content {
          flex: 1;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          padding: 1rem;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 65% 35%;
          gap: 0.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .right-column {
          min-width: 0;
          width: 100%;
        }

        .left-column {
          min-width: 0;
          width: 100%;
        }

        .section-card {
          background: white;
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: visible;
          flex: 1;
        }

        .section-title {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }
        .monitor-footer {
          background: rgba(0, 0, 0, 0.3);
          color: white;
          text-align: center;
          padding: 1.5rem;
          margin-top: auto;
          font-size: 0.875rem;
        }

        .monitor-footer p {
          margin: 0;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .monitor-header h1 {
            font-size: 2rem;
          }

          .monitor-content {
            padding: 1.5rem;
            overflow: visible;
          }
        }

        @media (max-width: 768px) {
          .monitor-header {
            padding: 1.5rem;
          }

          .monitor-header h1 {
            font-size: 1.5rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .monitor-content {
            padding: 1rem;
          }

          .content-grid {
            gap: 0.5rem;
          }

          .column {
            gap: 0.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .section-card {
            padding: 0.5rem;
            overflow: visible;
          }

          .section-title {
            font-size: 1rem;
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 640px) {
          .monitor-page {
            min-height: auto;
          }

          .monitor-header {
            padding: 1rem;
          }

          .monitor-header h1 {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
          }

          .subtitle {
            font-size: 0.875rem;
          }

          .connection-banner {
            margin-top: 1rem;
            padding: 0.75rem;
          }

          .monitor-content {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Monitor;
