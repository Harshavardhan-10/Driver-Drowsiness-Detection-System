

/**
 * Dashboard Component
 * 
 * Displays real-time drowsiness detection metrics in a responsive layout.
 * Shows EAR, MAR, Score, Status, and Yawn Count.
 * 
 * Props:
 *   - ear: Eye Aspect Ratio value
 *   - mar: Mouth Aspect Ratio value
 *   - score: Drowsiness score (0-100)
 *   - status: Current status (NORMAL, WARNING, DROWSY)
 *   - yawns: Yawn count
 *   - isConnected: WebSocket connection status
 */
const Dashboard = ({ ear = 0, mar = 0, score = 0, status = 'NORMAL', yawns = 0,isConnected = false }) => {
  /**
   * Get status color based on current status
   */
  const getStatusColor = () => {
    switch (status) {
      case 'DROWSY':
        return '#ef4444'; // red
      case 'WARNING':
        return '#f59e0b'; // amber
      case 'NORMAL':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  /**
   * Get score color based on score value
   */
  const getScoreColor = () => {
    if (score < 30) return '#10b981'; // green
    if (score < 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  /**
   * Format numeric value to 2 decimal places
   */
  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Drowsiness Detection Dashboard</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator"></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="metrics-grid">
        {/* EAR Card */}
        <div className="metric-card">
          <div className="metric-label">Eye Aspect Ratio</div>
          <div className="metric-value">{formatValue(ear)}</div>
          <div className="metric-description">
            {ear < 0.25 ? '🔴 Eyes Closed' : '🟢 Eyes Open'}
          </div>
          <div className="metric-bar">
            <div className="progress-bar" style={{ width: `${Math.min(ear * 200, 100)}%` }}></div>
          </div>
        </div>

        {/* MAR Card */}
        <div className="metric-card">
          <div className="metric-label">Mouth Aspect Ratio</div>
          <div className="metric-value">{formatValue(mar)}</div>
          <div className="metric-description">
            {mar > 0.75 ? '🥱 Yawning' : '😐 Normal'}
          </div>
          <div className="metric-bar">
            <div className="progress-bar" style={{ width: `${Math.min(mar * 150, 100)}%` }}></div>
          </div>
        </div>

        {/* Score Card */}
        <div className="metric-card">
          <div className="metric-label">Drowsiness Score</div>
          <div className="metric-value" style={{ color: getScoreColor() }}>
            {score}
          </div>
          <div className="metric-unit">/100</div>
          <div className="metric-bar">
            <div className="progress-bar" style={{ 
              width: `${score}%`,
              backgroundColor: getScoreColor()
            }}></div>
          </div>
        </div>

        {/* Status Card */}
        <div className="metric-card">
          <div className="metric-label">Status</div>
          <div className="metric-status" style={{ color: getStatusColor() }}>
            {status}
          </div>
          <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
            {status === 'DROWSY' && '⚠️ ALERT'}
            {status === 'WARNING' && '⚠️ WARNING'}
            {status === 'NORMAL' && 'OK'}
            {status === 'NO_FACE' && 'NO FACE DETECTED'}
          </div>
        </div>
      </div>
      
        {/* Yawn Count Card */}
        <div className="yawn-card">
          <div className="metric-label">Yawn Count</div>
          <div className="metric-value">{yawns}</div>
          <div className="metric-description">
            {yawns >= 3 ? '⚠️ Multiple yawns' : '👍 Normal'}
          </div>
          <div className="yawn-counter">
            {Array.from({ length: Math.min(yawns, 5) }).map((_, i) => (
              <span key={i} className="yawn-dot">🥱</span>
            ))}
          </div>
        </div>

        

      <style>{`
        .dashboard-container {
          width: 100%;
          min-width: 0;
          padding: 0.5rem;
          background: transparent;
          min-height: auto;
          height: auto;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 1.2rem;
          color: #1f2937;
          font-weight: 700;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .connection-status.connected {
          color: #10b981;
        }

        .connection-status.disconnected {
          color: #ef4444;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          background-color: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .metric-card.large {
          grid-column: span 1;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          .metric-card.large {
            grid-column: auto;
          }
        }

        .metric-label {
          font-size: 0.6rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 1rem;
          font-weight: 400;
          color: #1f2937;
        }

        .metric-value-large {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
        }

        .metric-unit {
          font-size: 0.5rem;
          color: #9ca3af;
          text-align: center;
        }

        .metric-status {
          font-size: 0.75rem;
          font-weight: 400;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-description {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
        }

        .yawn-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          width: fit-content;
          font-weight: 400;
          align-self: center;
          text-align: center;
          margin-top: 0.5rem;
        }

        .metric-bar {
          width: 100%;
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .yawn-counter {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          min-height: 1.5rem;
        }

        .yawn-dot {
          font-size: 1.25rem;
        }

        .threshold-info {
          background: white;
          border-radius: 12px;
          padding: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .threshold-info h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .threshold-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .threshold-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }

        .threshold-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .threshold-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .dashboard-container {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .metric-value {
            font-size: 1.2rem;
          }

          .metric-value-large {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
