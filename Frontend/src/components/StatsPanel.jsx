

/**
 * StatsPanel Component
 * 
 * Displays session statistics and historical data.
 * 
 * Props:
 *   - sessionStats: Object containing session statistics
 */
const StatsPanel = ({ sessionStats = {} }) => {
  const {
    framesProcessed = 0,
    maxScore = 0,
    averageScore = 0,
    sessionDuration = '0s',
    alertCount = 0,
    yawnCount = 0,
    lastUpdate = new Date()
  } = sessionStats;

  return (
    <div className="stats-panel">
      <h3 className="panel-title">Session Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-info">
            <span className="stat-label">Frames Processed</span>
            <span className="stat-value">{framesProcessed}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-label">Max Score</span>
            <span className="stat-value">{maxScore}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">{averageScore.toFixed(1)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{sessionDuration}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-label">Alerts</span>
            <span className="stat-value">{alertCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🥱</div>
          <div className="stat-info">
            <span className="stat-label">Yawns</span>
            <span className="stat-value">{yawnCount}</span>
          </div>
        </div>
      </div>

      <div className="last-update">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      <style>{`
        .stats-panel {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .panel-title {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          color: white;
        }

        .stat-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .last-update {
          text-align: center;
          font-size: 0.75rem;
          color: #9ca3af;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 0.75rem;
          }

          .stat-value {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;
