import { useRef, useEffect, useState } from 'react';

/**
 * AlertBox Component
 * 
 * Displays drowsiness alerts and plays alarm sound when status changes
 * to WARNING, DROWSY, or CRITICAL.
 * 
 * Props:
 *   - status: Current status (NORMAL, WARNING, DROWSY, CRITICAL)
 *   - score: Current drowsiness score (0-100)
 *   - yawns: Current yawn count
 *   - onDismiss: Callback when user dismisses the alert
 */
  const AlertBox = ({ status = 'NORMAL', score = 0, yawns = 0, onDismiss }) => {
  const audioRef = useRef(null);

  /**
   * Get alert configuration based on status
   */
  const getAlertConfig = () => {
    if (status === 'WARNING') {
      return {
        title: 'WARNING',
        message: 'Signs of drowsiness detected. Stay alert!',
        icon: '⚠️',
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        borderColor: '#fcd34d',
        severity: 'warning'
      };
    }
    return {
      title: 'DROWSINESS DETECTED!',
      message: 'Your eyes have been closed for too long. Stay alert!',
      icon: '🚨',
      color: '#ef4444',
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
      severity: 'critical'
    };
  };

  /**
   * Play alarm sound
   */
  const playAlarm = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Audio playback failed:', error);
          });
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  /**
   * Stop alarm sound
   */
  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /**
   * Effect: Handle status changes and play alarm
   */
  useEffect(() => {

      if (status === "DROWSY") {
          playAlarm();
      } else {
          stopAlarm();
      }

      return () => {
          stopAlarm();
      };

  }, [status]);
  /**
   * Handle alert dismiss
   */
  const handleDismiss = () => {
    stopAlarm();
    if (onDismiss) {
      onDismiss();
    }
  };

  const config = getAlertConfig();

  return (
    <>
      {/* Hidden audio element for playing alarm */}
      <audio
        ref={audioRef}
        src="/alarm.mp3"
        preload="auto"
        loop={status === 'DROWSY'}
         onError={() => console.error("alarm.mp3 not found")}
      />

      {/* Alert Box */}
        <div 
          className="alert-box-wrapper"
          style={{
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor
          }}
        >
          <div className="alert-content">
            <div className="alert-header">
              <span className="alert-icon">{config.icon}</span>
              <h2 className="alert-title" style={{ color: config.color }}>
                {config.title}
              </h2>
              <button className="alert-close-btn" onClick={handleDismiss}>
                ✕
              </button>
            </div>

            <p className="alert-message">{config.message}</p>

            {/* Alert Details */}
            <div className="alert-details">
              <div className="detail-item">
                <span className="detail-label">Drowsiness Score:</span>
                <span className="detail-value" style={{ color: config.color }}>
                  {score}/100
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Yawns Detected:</span>
                <span className="detail-value" style={{ color: config.color }}>
                  {yawns}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="alert-action-btn"
              style={{
                backgroundColor: config.color,
                borderColor: config.color
              }}
              onClick={handleDismiss}
            >
              I'm Awake - Dismiss Alert
            </button>

            {/* Severity Indicator */}
            {status === 'DROWSY' && (
              <div className="severity-indicator critical">
                🔴 CRITICAL - Take immediate action!
              </div>
            )}
          </div>

          {/* Animation Effects */}
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateY(-100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
              }
              50% {
                box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
              }
            }

            @keyframes shake {
              0%, 100% {
                transform: translateX(0);
              }
              10%, 30%, 50%, 70%, 90% {
                transform: translateX(-5px);
              }
              20%, 40%, 60%, 80% {
                transform: translateX(5px);
              }
            }

            .alert-box-wrapper {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              max-width: 600px;
              width: 90%;
              border: 2px solid;
              border-radius: 12px;
              padding: 1.5rem;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              z-index: 1000;
              animation: slideIn 0.3s ease-out;
              ${status === 'DROWSY' ? 'animation: slideIn 0.3s ease-out, pulse 1.5s infinite, shake 0.5s ease-in-out;' : ''}
            }

            .alert-content {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }

            .alert-header {
              display: flex;
              align-items: center;
              gap: 1rem;
              position: relative;
            }

            .alert-icon {
              font-size: 2rem;
              flex-shrink: 0;
            }

            .alert-title {
              margin: 0;
              font-size: 1.25rem;
              font-weight: 700;
              flex: 1;
            }

            .alert-close-btn {
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: #6b7280;
              padding: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: all 0.2s;
            }

            .alert-close-btn:hover {
              background-color: rgba(0, 0, 0, 0.1);
              color: #1f2937;
            }

            .alert-message {
              margin: 0;
              font-size: 1rem;
              color: #374151;
              line-height: 1.5;
            }

            .alert-details {
              display: flex;
              gap: 1.5rem;
              padding: 1rem;
              background: rgba(255, 255, 255, 0.5);
              border-radius: 8px;
            }

            .detail-item {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }

            .detail-label {
              font-size: 0.75rem;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .detail-value {
              font-size: 1.25rem;
              font-weight: 700;
            }

            .alert-action-btn {
              padding: 0.75rem 1.5rem;
              font-size: 1rem;
              font-weight: 600;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .alert-action-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
            }

            .alert-action-btn:active {
              transform: translateY(0);
            }

            .severity-indicator {
              padding: 0.75rem 1rem;
              border-radius: 8px;
              font-size: 0.875rem;
              font-weight: 600;
              text-align: center;
            }

            .severity-indicator.critical {
              background-color: rgba(239, 68, 68, 0.1);
              color: #991b1b;
              border: 1px solid #fca5a5;
              animation: pulse 1s infinite;
            }

            .severity-indicator.warning {
              background-color: rgba(245, 158, 11, 0.1);
              color: #92400e;
              border: 1px solid #fcd34d;
            }

            @media (max-width: 640px) {
              .alert-box-wrapper {
                width: 95%;
                padding: 1rem;
              }

              .alert-title {
                font-size: 1.125rem;
              }

              .alert-message {
                font-size: 0.875rem;
              }

              .alert-details {
                flex-direction: column;
                gap: 0.75rem;
              }

              .alert-action-btn {
                font-size: 0.875rem;
                padding: 0.625rem 1.25rem;
              }
            }
          `}</style>
        </div>
    </>
  );
};

export default AlertBox;
