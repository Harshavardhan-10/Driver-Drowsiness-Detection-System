import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamFeed from '../components/WebcamFeed';
import AlertBox from '../components/AlertBox';
import websocketService from '../services/websocket';
import {
  ScanFace,
  Eye,
  Gauge,
  Wind,
  RotateCcw,
  ArrowLeft,
  ScanLine,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_META = {
  NORMAL: { color: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' },
  WARNING: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  DROWSY: { color: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
  NO_FACE: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.35)' },
};

const getStatusMeta = (status) =>
  STATUS_META[status] || STATUS_META.NO_FACE;

const getScoreColor = (score) => {
  if (score < 30) return '#34d399';
  if (score < 60) return '#fbbf24';
  return '#fb7185';
};

const formatValue = (value) =>
  typeof value === 'number' ? value.toFixed(2) : '0.00';

/* ------------------------------------------------------------------ */
/* Monitor Page                                                        */
/*                                                                     */
/* Fixed-viewport monitoring console (no page scrolling):              */
/* - WebcamFeed: captures and streams video frames                     */
/* - Status rail: live detection metrics and session statistics        */
/* - AlertBox: critical drowsiness alert overlay                       */
/*                                                                     */
/* Manages the WebSocket connection and real-time detection results.   */
/* ------------------------------------------------------------------ */

const Monitor = () => {
  const navigate = useNavigate();

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
      alert: data.alert || false,
      overlay: data.overlay || null
    });

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
  }, []);

  /**
   * Handle WebSocket connection close
   */
  const handleConnectionClose = useCallback(() => {
    console.log('WebSocket disconnected');
    setIsConnected(false);
  }, []);

  /**
   * Reset detector state after an alert has been handled
   */
  const handleDismissAlert = async () => {
    setDetectionData(prev => ({
      ...prev,
      score: 0,
      status: "NORMAL",
      yawns: 0,
      alert: false
    }));

    try {
      await fetch(
        `${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')}/detector/reset`,
        {
          method: "POST"
        }
      );
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

  const statusMeta = getStatusMeta(detectionData.status);
  const scoreColor = getScoreColor(detectionData.score);
  const earPercent = Math.min(detectionData.ear * 200, 100);
  const marPercent = Math.min(detectionData.mar * 150, 100);
  const yawnDots = Array.from({ length: Math.max(Math.min(detectionData.yawns, 5), 0) });

  return (
    <div className="ddm-page">
      {/* ============================ TOP BAR ============================ */}
      <header className="ddm-topbar">
        <button type="button" className="ddm-exit" onClick={() => navigate('/')} aria-label="Back to home">
          <ArrowLeft size={15} strokeWidth={2.4} />
          <span>Exit</span>
        </button>

        <div className="ddm-topbar-brand">
          <span className="ddm-brand-icon" aria-hidden="true"><ScanFace size={17} strokeWidth={2.2} /></span>
          <span className="ddm-brand-name">Drowsiness<span> Detection</span></span>
          <span className="ddm-topbar-divider" aria-hidden="true" />
          <span className="ddm-topbar-mode">LIVE MONITORING</span>
        </div>

        <div className={`ddm-conn ${isConnected ? 'connected' : 'disconnected'}`} role="status">
          <span className="ddm-conn-dot" />
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </header>

      {/* ============================== ALERT ============================ */}
      {showAlert && (
        <AlertBox
          status={detectionData.status}
          score={detectionData.score}
          yawns={detectionData.yawns}
          onDismiss={async () => {
            setShowAlert(false);
            alertCooldownRef.current = true;
            setDetectionData({
              ear: 0,
              mar: 0,
              score: 0,
              status: "NORMAL",
              yawns: 0,
              alert: false
            });

            await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')}/detector/dismiss`, {
              method: "POST"
            });
            setTimeout(() => {
              alertCooldownRef.current = false;
            }, 6000);
          }}
        />
      )}

      {/* ============================== MAIN ============================= */}
      <main className="ddm-main">
        {/* ------------------------ Camera panel ------------------------ */}
        <section className="ddm-panel ddm-cam-panel ddm-enter" style={{ '--d': '80ms' }} aria-label="Live camera feed">
          <div className="ddm-panel-head">
            <h1 className="ddm-panel-title">
              <span className="ddm-title-icon" aria-hidden="true">
                <ScanLine size={14} strokeWidth={2.1} />
              </span>
              Live Camera Feed
            </h1>
            <div className="ddm-panel-actions">
              <span className={`ddm-rec ${isConnected ? 'on' : ''}`}>
                <span className="ddm-rec-dot" />
                {isConnected ? 'STREAMING' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="ddm-cam-stage">
            <div className="ddm-scanline" aria-hidden="true" />
            <WebcamFeed
              websocket={websocketService}
              isConnected={isConnected}
              detection={detectionData}
            />

            {connectionError && (
              <div className="ddm-error-toast" role="alert">{connectionError}</div>
            )}
          </div>
        </section>

        {/* ------------------------- Status rail ------------------------- */}
        <aside className="ddm-rail ddm-enter" style={{ '--d': '160ms' }} aria-label="Detection metrics">

          {/* Driver status hero */}
          <section className="ddm-status-card">
            <div className="ddm-status-head">
              <span className="ddm-eyebrow">Driver Status</span>
              <span className={`ddm-status-dot ${detectionData.status === 'DROWSY' ? 'critical' : ''}`} style={{ background: statusMeta.color, boxShadow: `0 0 12px ${statusMeta.glow}` }} />
            </div>

            <div className="ddm-status-value" style={{ color: statusMeta.color }}>
              {detectionData.status === 'NO_FACE' ? 'NO FACE' : detectionData.status}
            </div>
            <p className="ddm-status-hint">
              {detectionData.status === 'DROWSY' && 'Fatigue detected — wake-up alert issued.'}
              {detectionData.status === 'WARNING' && 'Early fatigue signs — stay alert.'}
              {detectionData.status === 'NO_FACE' && 'Looking for a face in frame…'}
              {detectionData.status === 'NORMAL' && 'Driver attentive. All readings nominal.'}
            </p>

            <div className="ddm-score-block">
              <div className="ddm-score-row">
                <span className="ddm-score-label">Drowsiness Score</span>
                <span className="ddm-score-value">
                  <strong style={{ color: scoreColor }}>{Math.round(detectionData.score)}</strong>
                  <span className="ddm-score-unit">/100</span>
                </span>
              </div>
              <div className="ddm-bar">
                <span
                  className="ddm-bar-fill"
                  style={{ width: `${detectionData.score}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`, boxShadow: `0 0 10px ${scoreColor}66` }}
                />
              </div>
            </div>

            <div className="ddm-yawn-row">
              <span className="ddm-yawn-label">
                <Wind size={13} strokeWidth={2.2} />
                Yawns
              </span>
              <span className="ddm-yawn-dots" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <span key={dot} className={`ddm-yawn-dot ${dot < yawnDots.length ? 'filled' : ''}`} />
                ))}
              </span>
              <strong className="ddm-yawn-count">{detectionData.yawns}</strong>
            </div>
          </section>

          {/* Metric tiles */}
          <div className="ddm-tiles">
            <article className="ddm-tile">
              <div className="ddm-tile-head">
                <Eye size={14} strokeWidth={2.1} />
                <span>Eye Aspect Ratio</span>
              </div>
              <div className="ddm-tile-value">{formatValue(detectionData.ear)}</div>
              <div className="ddm-tile-tag" style={{ color: detectionData.ear < 0.25 ? '#fb7185' : '#34d399' }}>
                {detectionData.ear < 0.25 ? 'Eyes Closed' : 'Eyes Open'}
              </div>
              <div className="ddm-bar ddm-bar-thin">
                <span className="ddm-bar-fill" style={{ width: `${earPercent}%` }} />
              </div>
            </article>

            <article className="ddm-tile">
              <div className="ddm-tile-head">
                <Wind size={14} strokeWidth={2.1} />
                <span>Mouth Aspect Ratio</span>
              </div>
              <div className="ddm-tile-value">{formatValue(detectionData.mar)}</div>
              <div className="ddm-tile-tag" style={{ color: detectionData.mar > 0.75 ? '#fbbf24' : '#34d399' }}>
                {detectionData.mar > 0.75 ? 'Yawning' : 'Normal'}
              </div>
              <div className="ddm-bar ddm-bar-thin">
                <span className="ddm-bar-fill" style={{ width: `${marPercent}%` }} />
              </div>
            </article>

            <article className="ddm-tile ddm-tile-info">
              <div className="ddm-tile-head">
                <Gauge size={14} strokeWidth={2.1} />
                <span>Stream Rate</span>
              </div>
              <div className="ddm-tile-value">10<span className="ddm-tile-unit"> fps</span></div>
              <div className="ddm-tile-tag ok">Real-time analysis</div>
              <div className="ddm-bar ddm-bar-thin">
                <span className="ddm-bar-fill" style={{ width: isConnected ? '84%' : '6%' }} />
              </div>
            </article>

            <article className="ddm-tile ddm-tile-info">
              <div className="ddm-tile-head">
                <ScanLine size={14} strokeWidth={2.1} />
                <span>Detection Engine</span>
              </div>
              <div className="ddm-tile-value">
                {isConnected ? 'ONLINE' : 'WAIT'}
              </div>
              <div className="ddm-tile-tag ok">MediaPipe · WebSocket</div>
              <div className="ddm-bar ddm-bar-thin">
                <span className="ddm-bar-fill" style={{ width: isConnected ? '100%' : '6%' }} />
              </div>
            </article>
          </div>

          {/* Rail footer */}
          <div className="ddm-rail-foot">
            <button type="button" className="ddm-reset" onClick={handleDismissAlert}>
              <RotateCcw size={14} strokeWidth={2.2} />
              Reset Detector
            </button>
            <span className="ddm-rail-note">Alerts auto-dismiss after review</span>
          </div>
        </aside>
      </main>

      <style>{`
        /* ================================================================
           Tokens (matches Home design system)
           ================================================================ */
        .ddm-page {
          --bg: #070b14;
          --bg-raised: rgba(255, 255, 255, 0.03);
          --border: rgba(148, 163, 184, 0.14);
          --border-strong: rgba(148, 163, 184, 0.24);
          --text: #f1f5f9;
          --text-muted: #94a3b8;
          --text-faint: #64748b;
          --accent: #22d3ee;
          --accent-2: #38bdf8;
          --accent-soft: rgba(34, 211, 238, 0.12);
          --ok: #34d399;
          --warn: #fbbf24;
          --danger: #fb7185;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 22px;
          --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-display: 'Space Grotesk', 'Inter', sans-serif;

          /* Fixed viewport console: no page scrolling */
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          display: flex;
          flex-direction: column;

          width: 100%;
          background:
            radial-gradient(46% 38% at 82% 0%, rgba(34, 211, 238, 0.08), transparent 62%),
            radial-gradient(40% 40% at 8% 100%, rgba(99, 102, 241, 0.07), transparent 60%),
            var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.45;
          -webkit-font-smoothing: antialiased;
        }

        .ddm-page *,
        .ddm-page *::before,
        .ddm-page *::after {
          box-sizing: border-box;
        }

        .ddm-page :is(h1, h2, h3, p, ul, ol) {
          margin: 0;
        }

        .ddm-page button:focus-visible,
        .ddm-page a:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 6px;
        }

        .ddm-page strong {
          font-variant-numeric: tabular-nums;
        }

        /* ================================================================
           Top bar (fixed height)
           ================================================================ */
        .ddm-topbar {
          flex-shrink: 0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0 clamp(0.9rem, 2.5vw, 1.5rem);
          border-bottom: 1px solid var(--border);
          background: rgba(7, 11, 20, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .ddm-topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }

        .ddm-brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          color: var(--accent);
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(56, 189, 248, 0.08));
          border: 1px solid rgba(34, 211, 238, 0.35);
          box-shadow: 0 0 18px -4px rgba(34, 211, 238, 0.45);
          flex-shrink: 0;
        }

        .ddm-brand-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .ddm-brand-name span {
          color: var(--accent);
        }

        .ddm-topbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border-strong);
        }

        .ddm-topbar-mode {
          color: var(--text-faint);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          white-space: nowrap;
        }

        .ddm-exit {
          order: -1;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-strong);
          background: var(--bg-raised);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
        }

        .ddm-exit:hover {
          color: var(--text);
          border-color: rgba(34, 211, 238, 0.5);
          background: var(--accent-soft);
        }

        .ddm-conn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .ddm-conn.connected {
          color: var(--ok);
          background: rgba(52, 211, 153, 0.09);
          border: 1px solid rgba(52, 211, 153, 0.35);
        }

        .ddm-conn.disconnected {
          color: var(--warn);
          background: rgba(251, 191, 36, 0.09);
          border: 1px solid rgba(251, 191, 36, 0.35);
        }

        .ddm-conn-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: ddm-blink 1.8s ease-in-out infinite;
        }

        @keyframes ddm-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        /* ================================================================
           Main layout — fills remaining viewport, never scrolls
           ================================================================ */
        .ddm-main {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) clamp(310px, 28vw, 392px);
          gap: clamp(0.75rem, 1.6vw, 1.1rem);
          padding: clamp(0.75rem, 1.6vw, 1.1rem);
        }

        /* ------------------------------ Panels -------------------------- */
        .ddm-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          min-width: 0;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(17, 26, 43, 0.55), rgba(9, 14, 26, 0.65));
          backdrop-filter: blur(12px);
          box-shadow: 0 24px 48px -28px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        .ddm-panel-head {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.8rem 1.1rem;
          border-bottom: 1px solid var(--border);
        }

        .ddm-panel-title {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .ddm-title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          color: var(--accent);
          background: var(--accent-soft);
          border: 1px solid rgba(34, 211, 238, 0.3);
        }

        .ddm-rec {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.28rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--border-strong);
          background: var(--bg-raised);
          color: var(--text-faint);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .ddm-rec.on {
          color: var(--danger);
          border-color: rgba(251, 113, 133, 0.4);
          background: rgba(251, 113, 133, 0.08);
        }

        .ddm-rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .ddm-rec.on .ddm-rec-dot {
          animation: ddm-blink 1.4s ease-in-out infinite;
        }

        /* --------------------------- Camera stage ----------------------- */
        .ddm-cam-stage {
          position: relative;
          flex: 1;
          min-height: 0;
          padding: clamp(0.7rem, 1.4vw, 1rem);
          display: flex;
          background:
            radial-gradient(70% 70% at 50% 40%, rgba(34, 211, 238, 0.04), transparent 70%);
        }

        .ddm-scanline {
          position: absolute;
          left: clamp(0.7rem, 1.4vw, 1rem);
          right: clamp(0.7rem, 1.4vw, 1rem);
          top: -12%;
          height: 56px;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(34, 211, 238, 0.05) 60%,
            rgba(34, 211, 238, 0.22) 98%,
            rgba(103, 232, 249, 0.4) 100%
          );
          animation: ddm-scan 4.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @keyframes ddm-scan {
          0% { top: -12%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { top: 104%; opacity: 0; }
        }

        .ddm-error-toast {
          position: absolute;
          top: calc(clamp(0.7rem, 1.4vw, 1rem) + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 6;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(251, 113, 133, 0.45);
          background: rgba(40, 12, 22, 0.9);
          color: #fecdd3;
          font-size: 0.78rem;
          font-weight: 500;
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }

        /* WebcamFeed integration (component styles overridden in-place) */
        .ddm-page .webcam-feed-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 0;
          gap: 0;
          max-width: none;
        }

        .ddm-page .webcam-wrapper {
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          margin: 0;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          background: #05080f;
        }

        .ddm-page .webcam-video {
          width: 100%;
          height: 100%;
          max-height: none;
          object-fit: cover;
          object-position: center;
        }

        .ddm-page .info-message {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 14px;
          z-index: 5;
          width: max-content;
          max-width: calc(100% - 2rem);
          padding: 0.45rem 1rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 500;
          text-align: center;
          color: #e2e8f0;
          background: rgba(7, 13, 25, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.3);
          backdrop-filter: blur(8px);
        }

        .ddm-page .info-message.warning {
          background: rgba(41, 28, 6, 0.88);
          color: #fde68a;
          border-color: rgba(251, 191, 36, 0.4);
        }

        .ddm-page .info-message.info {
          bottom: 56px;
          background: rgba(6, 25, 35, 0.88);
          color: #a5f3fc;
          border-color: rgba(34, 211, 238, 0.4);
        }

        /* ================================================================
           Status rail
           ================================================================ */
        .ddm-rail {
          display: flex;
          flex-direction: column;
          gap: clamp(0.6rem, 1.2vw, 0.9rem);
          min-height: 0;
          min-width: 0;
        }

        .ddm-eyebrow {
          display: inline-block;
          color: var(--text-faint);
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        /* --------------------------- Status card ------------------------ */
        .ddm-status-card {
          flex-shrink: 0;
          padding: clamp(0.9rem, 1.6vw, 1.15rem);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(17, 26, 43, 0.6), rgba(9, 14, 26, 0.7));
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .ddm-status-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ddm-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .ddm-status-dot.critical {
          animation: ddm-pulse-dot 1s ease-out infinite;
        }

        @keyframes ddm-pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.55); }
          70% { box-shadow: 0 0 0 10px rgba(251, 113, 133, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
        }

        .ddm-status-value {
          margin-top: 0.55rem;
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 2.6vw, 2.05rem);
          font-weight: 700;
          letter-spacing: 0.02em;
          line-height: 1.1;
          transition: color 0.3s ease;
        }

        .ddm-status-hint {
          margin-top: 0.3rem;
          min-height: 1.2em;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ddm-score-block {
          margin-top: 0.95rem;
          padding-top: 0.95rem;
          border-top: 1px solid var(--border);
        }

        .ddm-score-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .ddm-score-label {
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .ddm-score-value {
          display: inline-flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .ddm-score-value strong {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
          transition: color 0.3s ease;
        }

        .ddm-score-unit {
          font-size: 0.72rem;
          color: var(--text-faint);
        }

        .ddm-bar {
          display: block;
          height: 7px;
          margin-top: 0.55rem;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.14);
          overflow: hidden;
        }

        .ddm-bar-thin {
          height: 4px;
          margin-top: auto;
        }

        .ddm-bar-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .ddm-yawn-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.95rem;
          padding-top: 0.95rem;
          border-top: 1px solid var(--border);
        }

        .ddm-yawn-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .ddm-yawn-label svg {
          color: var(--accent);
        }

        .ddm-yawn-dots {
          display: inline-flex;
          gap: 0.35rem;
          flex: 1;
        }

        .ddm-yawn-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.18);
          border: 1px solid var(--border-strong);
          transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .ddm-yawn-dot.filled {
          background: var(--warn);
          border-color: var(--warn);
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
        }

        .ddm-yawn-count {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
        }

        /* ----------------------------- Tiles ---------------------------- */
        .ddm-tiles {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: minmax(0, 1fr);
          gap: clamp(0.6rem, 1.2vw, 0.9rem);
        }

        .ddm-tile {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-height: 0;
          min-width: 0;
          padding: clamp(0.75rem, 1.4vw, 1rem);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-raised);
          backdrop-filter: blur(10px);
          transition: border-color 0.25s ease, background-color 0.25s ease;
        }

        .ddm-tile:hover {
          border-color: rgba(34, 211, 238, 0.4);
          background: rgba(34, 211, 238, 0.045);
        }

        .ddm-tile-head {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--text-faint);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
        }

        .ddm-tile-head svg {
          color: var(--accent);
          flex-shrink: 0;
        }

        .ddm-tile-value {
          font-family: var(--font-display);
          font-size: clamp(1.25rem, 2vw, 1.6rem);
          font-weight: 700;
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .ddm-tile-unit {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .ddm-tile-tag {
          min-height: 1.1em;
          font-size: 0.74rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .ddm-tile-tag.ok {
          color: var(--ok);
        }

        /* ---------------------------- Rail foot ------------------------- */
        .ddm-rail-foot {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .ddm-reset {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-strong);
          background: var(--bg-raised);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .ddm-reset:hover {
          color: var(--text);
          border-color: rgba(34, 211, 238, 0.5);
          background: var(--accent-soft);
          transform: translateY(-1px);
        }

        .ddm-rail-note {
          font-size: 0.68rem;
          color: var(--text-faint);
          text-align: right;
        }

        /* ================================================================
           AlertBox theme integration (dark glass)
           ================================================================ */
        .ddm-page .alert-box-wrapper {
          background-color: rgba(24, 14, 21, 0.96) !important;
          border-radius: 18px !important;
          box-shadow: 0 0 60px -12px rgba(251, 113, 133, 0.35), 0 30px 60px -24px rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .ddm-page .alert-message {
          color: #e2e8f0 !important;
        }

        .ddm-page .alert-details {
          background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .ddm-page .detail-label {
          color: var(--text-muted) !important;
        }

        .ddm-page .severity-indicator.critical {
          color: #fecdd3 !important;
          background-color: rgba(251, 113, 133, 0.12) !important;
          border: 1px solid rgba(251, 113, 133, 0.4) !important;
        }

        .ddm-page .alert-close-btn {
          color: var(--text-muted) !important;
        }

        .ddm-page .alert-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
        }

        /* ================================================================
           Entrance animation
           ================================================================ */
        .ddm-enter {
          opacity: 0;
          transform: translateY(14px);
          animation: ddm-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0ms);
        }

        @keyframes ddm-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ================================================================
           Reduced motion
           ================================================================ */
        @media (prefers-reduced-motion: reduce) {
          .ddm-enter {
            opacity: 1;
            transform: none;
            animation: none;
          }

          .ddm-scanline,
          .ddm-conn-dot,
          .ddm-rec-dot,
          .ddm-status-dot.critical {
            animation: none !important;
          }
        }

        /* ================================================================
           Responsive — compact but still scroll-free
           ================================================================ */
        @media (max-width: 1024px) {
          .ddm-main {
            grid-template-columns: minmax(0, 1fr) clamp(280px, 32vw, 340px);
          }

          .ddm-topbar-mode {
            display: none;
          }
        }

        @media (max-width: 860px) {
          .ddm-main {
            grid-template-columns: 1fr;
            grid-template-rows: minmax(0, 1.2fr) minmax(0, 1fr);
          }

          .ddm-tiles {
            grid-auto-rows: minmax(0, auto);
          }

          .ddm-rail-note {
            display: none;
          }

          /* Compact horizontal status card */
          .ddm-status-card {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            align-items: center;
            column-gap: 1.25rem;
          }

          .ddm-status-head {
            grid-row: 1;
            grid-column: 1 / -1;
          }

          .ddm-status-value {
            grid-row: 2;
            grid-column: 1;
            margin-top: 0.35rem;
            font-size: 1.4rem;
          }

          .ddm-status-hint {
            grid-row: 3;
            grid-column: 1;
            font-size: 0.72rem;
          }

          .ddm-score-block {
            grid-row: 2 / 4;
            grid-column: 2;
            align-self: center;
            margin-top: 0;
            padding-top: 0;
            border-top: 0;
          }

          .ddm-yawn-row {
            grid-row: 4;
            grid-column: 1 / -1;
            margin-top: 0.6rem;
            padding-top: 0.7rem;
            border-top: 1px solid var(--border);
          }
        }

        @media (max-width: 560px) {
          .ddm-topbar {
            height: 54px;
          }

          .ddm-brand-name span {
            display: none;
          }

          .ddm-exit span {
            display: none;
          }

          .ddm-exit {
            padding: 0.42rem 0.6rem;
          }

          /* Hide informational tiles; keep only live metrics */
          .ddm-tile-info {
            display: none;
          }

          .ddm-tiles {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-height: 720px) {
          .ddm-topbar {
            height: 52px;
          }

          .ddm-status-value {
            font-size: 1.4rem;
          }

          .ddm-score-block,
          .ddm-yawn-row {
            margin-top: 0.6rem;
            padding-top: 0.6rem;
          }

          .ddm-tile {
            padding: 0.6rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Monitor;
