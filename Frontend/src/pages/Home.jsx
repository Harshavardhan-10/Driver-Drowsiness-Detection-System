import { useNavigate } from 'react-router-dom';

/**
 * Home Page
 * 
 * Landing page with introduction and navigation to monitoring page.
 */
const Home = () => {
  const navigate = useNavigate();

  const handleStartMonitoring = () => {
    navigate('/monitor');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="main-title">Driver Drowsiness Detection</h1>
          <p className="subtitle">Stay Alert, Stay Safe</p>
        </div>
      </header>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Real-Time Drowsiness Detection System</h2>
            <p>
              Advanced AI-powered system that monitors driver alertness in real-time,
              using facial recognition and eye-tracking technology to detect signs of drowsiness.
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Eye Tracking</h3>
                <p>Monitors eye closure patterns and blink rate</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Yawn Detection</h3>
                <p>Detects yawning as an indicator of drowsiness</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Real-Time Alerts</h3>
                <p>Instant notifications when drowsiness is detected</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Live Dashboard</h3>
                <p>View real-time metrics and detection scores</p>
              </div>
            </div>

            <button className="start-button" onClick={handleStartMonitoring}>
              Start Monitoring
            </button>
          </div>

          <div className="hero-image">
            <div className="image-placeholder">
              <span>Webcam Feed Preview</span>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Camera</h3>
              <p>Grant camera permission and initialize webcam feed</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Real-Time Processing</h3>
              <p>AI analyzes facial features at 10 FPS for accuracy</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Detection</h3>
              <p>Calculates Eye and Mouth Aspect Ratios</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Alert Generation</h3>
              <p>Triggers alerts with audio notification if drowsiness detected</p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="technology">
          <h2>Powered By</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <h4>MediaPipe</h4>
              <p>Advanced facial landmark detection</p>
            </div>
            <div className="tech-item">
              <h4>FastAPI</h4>
              <p>High-performance backend server</p>
            </div>
            <div className="tech-item">
              <h4>React</h4>
              <p>Modern frontend interface</p>
            </div>
            <div className="tech-item">
              <h4>WebSocket</h4>
              <p>Real-time bidirectional communication</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 Driver Drowsiness Detection System. All rights reserved.</p>
      </footer>

      <style>{`
        .home-container {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: #1f2937;
          display: flex;
          flex-direction: column;
        }

        .home-header {
          background: rgba(0, 0, 0, 0.2);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          overflow: visible;
        }

        .main-title {
          margin: 0;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          letter-spacing: -1px;
        }

        .subtitle {
          margin: 0.5rem 0 0 0;
          font-size: 1.25rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .home-main {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 4rem 2rem;
          box-sizing: border-box;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3rem;
          align-items: center;
          margin-bottom: 4rem;
        }

        .hero-content h2 {
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
          color: white;
          font-weight: 700;
        }

        .hero-content > p {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .feature-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .feature-card p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .start-button {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .image-placeholder {
          width: 100%;
          max-width: 500px;
          height: 400px;
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .how-it-works {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          margin-bottom: 4rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .how-it-works h2 {
          text-align: center;
          margin: 0 0 2rem 0;
          font-size: 2rem;
          color: #1f2937;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .step {
          text-align: center;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1rem;
        }

        .step h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .step p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .technology {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .technology h2 {
          text-align: center;
          margin: 0 0 2rem 0;
          font-size: 2rem;
          color: #1f2937;
        }

        .tech-stack {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .tech-item {
          text-align: center;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }

        .tech-item h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .tech-item p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .home-footer {
          background: rgba(0, 0, 0, 0.3);
          color: white;
          text-align: center;
          padding: 2rem;
          margin-top: auto;
        }

        .home-footer p {
          margin: 0;
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .tech-stack {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .main-title {
            font-size: 2rem;
          }

          .home-main {
            padding: 2rem 1rem;
          }

          .hero-content h2 {
            font-size: 1.75rem;
          }

          .hero-content > p {
            font-size: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .how-it-works,
          .technology {
            padding: 1.5rem;
          }

          .steps,
          .tech-stack {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;