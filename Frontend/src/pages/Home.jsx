import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Eye, Camera, BrainCircuit, BellRing, ScanFace, Activity, Cpu, ShieldCheck, Menu, X, Code2, ArrowRight, Zap, FileText,} from 'lucide-react';


const RESEARCH_PAPER_URL = '/research-paper.pdf';
const SOURCE_CODE_URL = 'https://github.com/Harshavardhan-10/Driver-Drowsiness-Detection-System';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Detection', href: '/monitor' },
  { label: 'Dashboard', href: '#how-it-works' },
  { label: 'About', href: '#trust' },
];

const STATS = [
  { value: '10 fps', label: 'Real-Time Detection', detail: 'Continuous frame-by-frame analysis' },
  { value: '95.2%', label: 'AI Accuracy', detail: 'Reliable across lighting conditions' },
  { value: '< 100ms', label: 'Response Time', detail: 'From detection to alert' },
  { value: '24/7', label: 'Driver Safety', detail: 'Non-stop vigilance on every trip' },
];

const STEPS = [
  {
    icon: Camera,
    title: 'Monitor',
    description:
      "The camera continuously monitors the driver's face and eyes in real time.",
  },
  {
    icon: BrainCircuit,
    title: 'Analyze',
    description:
      'AI analyzes eye closure, blinking, facial landmarks, and signs of fatigue.',
  },
  {
    icon: BellRing,
    title: 'Alert',
    description:
      'The system detects drowsiness and immediately triggers an audible alert.',
  },
];

const FEATURES = [
  {
    icon: ScanFace,
    title: 'Real-Time Face Detection',
    description: 'Facial landmarks are tracked live to keep the driver centered in view.',
  },
  {
    icon: Eye,
    title: 'Eye Closure Detection',
    description: 'Eye Aspect Ratio analysis catches micro-closures that signal fatigue.',
  },
  {
    icon: BrainCircuit,
    title: 'Drowsiness Classification',
    description: 'A scoring model combines EAR, MAR and yawn signals into one verdict.',
  },
  {
    icon: BellRing,
    title: 'Instant Alerts',
    description: 'Loud audio warnings fire the moment drowsiness crosses the threshold.',
  },
  {
    icon: Cpu,
    title: 'AI-Powered Analysis',
    description: 'MediaPipe landmarks feed a lightweight model running at 10 FPS.',
  },
  {
    icon: Activity,
    title: 'Continuous Monitoring',
    description: 'WebSocket streaming keeps metrics updating frame after frame.',
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Proactive protection',
    text: 'Fatigue is detected before it becomes dangerous, not after.',
  },
  {
    icon: Zap,
    title: 'Instant response',
    text: 'Alerts dispatch in under 100 milliseconds of detection.',
  },
  {
    icon: Activity,
    title: 'Always watching',
    text: 'Every frame is analyzed for the entire duration of the drive.',
  },
];

/* ------------------------------------------------------------------ */
/* Scroll-reveal hook                                                  */
/* ------------------------------------------------------------------ */

const useScrollReveal = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('dd-is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('dd-is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};


const Navbar = ({ onStartDetection }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="dd-navbar">
      <nav className="dd-navbar-inner" aria-label="Main navigation">
        <a className="dd-brand" href="#home">
          <span className="dd-brand-icon" aria-hidden="true">
            <ScanFace size={18} strokeWidth={2.2} />
          </span>
          <span className="dd-brand-name">
            Drowsiness<span> Detection</span>
          </span>
        </a>

        <ul className="dd-nav-links" id="primary-navigation">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/')) {
                    e.preventDefault();
                    setMenuOpen(false);
                    onStartDetection();
                  } else {
                    setMenuOpen(false);
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="dd-nav-actions">
          <button type="button" className="dd-btn dd-btn-primary dd-btn-sm" onClick={onStartDetection}>
            Start Detection
            <ArrowRight size={15} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="dd-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul className="dd-mobile-menu">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/')) {
                    e.preventDefault();
                    setMenuOpen(false);
                    onStartDetection();
                  } else {
                    setMenuOpen(false);
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="dd-btn dd-btn-primary dd-btn-block"
              onClick={() => {
                setMenuOpen(false);
                onStartDetection();
              }}
            >
              Start Detection
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};


const DashboardPreview = () => (
  <div className="dd-preview" aria-hidden="true">
    <div className="dd-preview-glow" />

    <div className="dd-window">
      {/* window chrome */}
      <div className="dd-window-bar">
        <span className="dd-window-dot" />
        <span className="dd-window-dot" />
        <span className="dd-window-dot" />
        <span className="dd-window-title">driver-monitor / live</span>
        <span className="dd-live-pill">
          <span className="dd-live-dot" />
          LIVE
        </span>
      </div>

      {/* camera viewport */}
      <div className="dd-viewport">
        <div className="dd-grid-overlay" />

        {/* face tracking frame */}
        <div className="dd-face">
          <span className="dd-corner dd-corner-tl" />
          <span className="dd-corner dd-corner-tr" />
          <span className="dd-corner dd-corner-bl" />
          <span className="dd-corner dd-corner-br" />
          <span className="dd-eye dd-eye-left" />
          <span className="dd-eye dd-eye-right" />
          <span className="dd-mouth" />
        </div>

        {/* scanning line */}
        <div className="dd-scanline" />

        {/* HUD chips */}
        <div className="dd-hud-chip dd-hud-top">
          <Eye size={13} strokeWidth={2.4} />
          EYE TRACKING ACTIVE
        </div>
        <div className="dd-hud-chip dd-hud-bottom">
          <ShieldCheck size={13} strokeWidth={2.4} />
          STATUS · ALERT
        </div>
      </div>

      {/* metric bars */}
      <div className="dd-metrics">
        <div className="dd-metric">
          <span className="dd-metric-label">EAR</span>
          <span className="dd-metric-bar">
            <span className="dd-metric-fill" style={{ width: '72%' }} />
          </span>
          <span className="dd-metric-value">0.31</span>
        </div>
        <div className="dd-metric">
          <span className="dd-metric-label">MAR</span>
          <span className="dd-metric-bar">
            <span className="dd-metric-fill dd-metric-fill-dim" style={{ width: '28%' }} />
          </span>
          <span className="dd-metric-value">0.12</span>
        </div>
        <div className="dd-metric">
          <span className="dd-metric-label">FPS</span>
          <span className="dd-metric-bar">
            <span className="dd-metric-fill dd-metric-fill-dim" style={{ width: '84%' }} />
          </span>
          <span className="dd-metric-value">10</span>
        </div>
      </div>
    </div>

    {/* floating card */}
    <div className="dd-float-card dd-float-card-top">
      <span className="dd-float-icon">
        <Zap size={14} strokeWidth={2.4} />
      </span>
      <div>
        <strong>Alert dispatched</strong>
        <span>&lt; 100ms response</span>
      </div>
    </div>
  </div>
);


const Home = () => {
  const navigate = useNavigate();
  useScrollReveal();

  const handleStartMonitoring = () => {
    navigate('/monitor');
  };

  return (
    <div className="dd-page" id="home">
      <Navbar onStartDetection={handleStartMonitoring} />

      <main>
        {/* ============================ HERO ========================= */}
        <section className="dd-hero" aria-labelledby="hero-heading">
          <div className="dd-hero-bg" aria-hidden="true" />

          <div className="dd-container dd-hero-inner">
            <div className="dd-hero-copy">
              <span className="dd-badge dd-animate-up" style={{ '--d': '0ms' }}>
                <span className="dd-badge-dot" />
                AI-POWERED DRIVER SAFETY
              </span>

              <h1 id="hero-heading" className="dd-hero-title dd-animate-up" style={{ '--d': '80ms' }}>
                Stay Alert. <span className="dd-text-gradient">Stay Safe.</span>
              </h1>

              <p className="dd-hero-sub dd-animate-up" style={{ '--d': '160ms' }}>
                Real-time AI-powered drowsiness detection designed to help prevent
                fatigue-related driving accidents.
              </p>

              <div className="dd-hero-actions dd-animate-up" style={{ '--d': '240ms' }}>
                <button type="button" className="dd-btn dd-btn-primary dd-btn-lg" onClick={handleStartMonitoring}>
                  Start Detection
                  <ArrowRight size={17} strokeWidth={2.4} />
                </button>
                <a
                  className="dd-btn dd-btn-ghost dd-btn-lg"
                  href={RESEARCH_PAPER_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <FileText size={17} strokeWidth={2.2} />
                  Research Paper
                </a>
              </div>
            </div>

            <div className="dd-hero-visual dd-animate-up" style={{ '--d': '200ms' }}>
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ============================ STATS ========================== */}
        <section className="dd-section dd-stats-section" aria-label="Key metrics">
          <div className="dd-container">
            <dl className="dd-stats-grid">
              {STATS.map((stat) => (
                <div className="dd-stat-card" data-reveal key={stat.label}>
                  <dt className="dd-stat-value">{stat.value}</dt>
                  <dd>
                    <span className="dd-stat-label">{stat.label}</span>
                    <span className="dd-stat-detail">{stat.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ========================= HOW IT WORKS ==================== */}
        <section className="dd-section" id="how-it-works" aria-labelledby="how-heading">
          <div className="dd-container">
            <div className="dd-section-head" data-reveal>
              <span className="dd-eyebrow">Workflow</span>
              <h2 id="how-heading">How Drowsiness Detection Works</h2>
              <p>Three steps between the camera and a life saved.</p>
            </div>

            <ol className="dd-steps">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <li className="dd-step" data-reveal style={{ '--d': `${index * 120}ms` }} key={step.title}>
                    <div className="dd-step-icon">
                      <StepIcon size={22} strokeWidth={1.9} />
                      <span className="dd-step-index">0{index + 1}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ======================== FEATURES ========================== */}
        <section className="dd-section" id="features" aria-labelledby="features-heading">
          <div className="dd-container">
            <div className="dd-section-head" data-reveal>
              <span className="dd-eyebrow">Capabilities</span>
              <h2 id="features-heading">Engineered for Awareness</h2>
              <p>Every layer of the stack exists to keep one eye on the road — yours.</p>
            </div>

            <div className="dd-features-grid">
              {FEATURES.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <article className="dd-feature-card" data-reveal style={{ '--d': `${(index % 3) * 90}ms` }} key={feature.title}>
                    <span className="dd-feature-icon">
                      <FeatureIcon size={21} strokeWidth={1.9} />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== TRUST / SAFETY ====================== */}
        <section className="dd-section" id="trust" aria-labelledby="trust-heading">
          <div className="dd-container">
            <div className="dd-trust">
              <div className="dd-trust-copy" data-reveal>
                <span className="dd-eyebrow">Why it matters</span>
                <h2 id="trust-heading">
                  Technology That Watches When Fatigue Takes&nbsp;Over.
                </h2>
                <p className="dd-trust-lede">
                  Driver fatigue is one of the leading causes of road accidents. This
                  system is built to recognize its earliest signs — heavy eyelids,
                  slower blinks, yawning — and intervene with a timely, unmistakable
                  alert before concentration slips away.
                </p>

                <ul className="dd-trust-list">
                  {TRUST_POINTS.map((point) => {
                    const PointIcon = point.icon;
                    return (
                      <li key={point.title}>
                        <span className="dd-trust-point-icon">
                          <PointIcon size={17} strokeWidth={2} />
                        </span>
                        <div>
                          <strong>{point.title}</strong>
                          <p>{point.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="dd-trust-visual" data-reveal>
                <div className="dd-alert-card">
                  <div className="dd-alert-header">
                    <span className="dd-alert-dot" />
                    DROWSINESS DETECTED
                  </div>

                  <div className="dd-alert-body">
                    <span className="dd-alert-icon">
                      <BellRing size={26} strokeWidth={1.8} />
                    </span>
                    <p>
                      Driver fatigue detected.
                      <br />
                      Issuing wake-up alert&hellip;
                    </p>
                    <div className="dd-waveform" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                        <span key={bar} style={{ '--i': bar }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================= FOOTER ============================ */}
      <footer className="dd-footer">
        <div className="dd-container">
          <div className="dd-footer-top">
            <div className="dd-footer-brand">
              <a className="dd-brand" href="#home">
                <span className="dd-brand-icon" aria-hidden="true">
                  <ScanFace size={18} strokeWidth={2.2} />
                </span>
                <span className="dd-brand-name">
                  Drowsiness<span> Detection</span>
                </span>
              </a>
              <p>
                AI-powered driver safety monitoring that detects fatigue in real time
                and alerts you before it is too late.
              </p>
            </div>

            <nav className="dd-footer-links" aria-label="Footer navigation">
              <h3>Navigate</h3>
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('/')) {
                          e.preventDefault();
                          handleStartMonitoring();
                        }
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="dd-footer-links">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#trust">Safety</a>
                </li>
                <li>
                  <a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartMonitoring();
                    }}
                  >
                    Live Demo
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="dd-footer-bottom">
            <p>&copy; 2026 Drowsiness Detection System. All rights reserved.</p>
            <a
              className="dd-footer-source"
              href={SOURCE_CODE_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="View source code on GitHub"
            >
              <Code2 size={16} strokeWidth={2} />
              Source Code
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        /* ================================================================
           Design tokens
           ================================================================ */
        .dd-page {
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
          --danger: #fb7185;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 24px;
          --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-display: 'Space Grotesk', 'Inter', sans-serif;

          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.55;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        html {
          scroll-behavior: smooth;
        }

        .dd-page *,
        .dd-page *::before,
        .dd-page *::after {
          box-sizing: border-box;
        }

        .dd-page :is(h1, h2, h3, p, ul, ol, dl, figure) {
          margin: 0;
        }

        .dd-page img,
        .dd-page svg {
          vertical-align: middle;
        }

        .dd-container {
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2rem);
        }

        /* ================================================================
           Shared controls
           ================================================================ */
        .dd-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.25s ease,
            background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }

        .dd-btn:focus-visible,
        .dd-page a:focus-visible,
        .dd-page button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 6px;
        }

        .dd-btn-primary {
          color: #04121a;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          box-shadow: 0 8px 24px -8px rgba(34, 211, 238, 0.55);
        }

        .dd-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px -10px rgba(34, 211, 238, 0.65);
        }

        .dd-btn-primary:active {
          transform: translateY(0);
        }

        .dd-btn-ghost {
          color: var(--text);
          background: var(--bg-raised);
          border-color: var(--border-strong);
          backdrop-filter: blur(8px);
        }

        .dd-btn-ghost:hover {
          border-color: rgba(34, 211, 238, 0.5);
          background: var(--accent-soft);
          transform: translateY(-2px);
        }

        .dd-btn-lg {
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
        }

        .dd-btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .dd-btn-block {
          width: 100%;
          padding: 0.8rem 1.25rem;
        }

        .dd-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(7, 11, 20, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }

        .dd-navbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0.8rem clamp(1.25rem, 4vw, 2rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .dd-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: var(--text);
        }

        .dd-brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: var(--accent);
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(56, 189, 248, 0.08));
          border: 1px solid rgba(34, 211, 238, 0.35);
          box-shadow: 0 0 18px -4px rgba(34, 211, 238, 0.45);
        }

        .dd-brand-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: -0.01em;
        }

        .dd-brand-name span {
          color: var(--accent);
        }

        .dd-nav-links {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          list-style: none;
          padding: 0;
        }

        .dd-nav-links a {
          display: inline-block;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .dd-nav-links a:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.06);
        }

        .dd-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .dd-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-strong);
          background: var(--bg-raised);
          color: var(--text);
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .dd-menu-toggle:hover {
          border-color: rgba(34, 211, 238, 0.5);
        }

        .dd-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0.75rem clamp(1.25rem, 4vw, 2rem) 1.25rem;
          border-top: 1px solid var(--border);
          background: rgba(7, 11, 20, 0.97);
        }

        .dd-mobile-menu a {
          display: block;
          padding: 0.7rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
        }

        .dd-mobile-menu a:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.06);
        }

        .dd-mobile-menu li:last-child {
          margin-top: 0.5rem;
        }


        .dd-hero {
          position: relative;
          padding: clamp(4rem, 9vh, 6.5rem) 0 clamp(3.5rem, 8vh, 5.5rem);
          overflow: hidden;
        }

        .dd-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(52% 42% at 78% 18%, rgba(34, 211, 238, 0.14), transparent 62%),
            radial-gradient(38% 34% at 12% 8%, rgba(99, 102, 241, 0.12), transparent 60%),
            radial-gradient(60% 46% at 50% 110%, rgba(14, 165, 233, 0.08), transparent 65%);
        }

        .dd-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(70% 60% at 50% 30%, black 0%, transparent 78%);
          -webkit-mask-image: radial-gradient(70% 60% at 50% 30%, black 0%, transparent 78%);
        }

        .dd-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
          align-items: center;
          gap: clamp(2.5rem, 5vw, 4.5rem);
        }

        .dd-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.42rem 0.95rem;
          border-radius: 999px;
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(34, 211, 238, 0.08);
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
        }

        .dd-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.6);
          animation: dd-pulse-ring 2.2s ease-out infinite;
        }

        @keyframes dd-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.55); }
          70% { box-shadow: 0 0 0 9px rgba(34, 211, 238, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
        }

        .dd-hero-title {
          margin-top: 1.4rem;
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 6vw, 4.1rem);
          line-height: 1.06;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .dd-text-gradient {
          background: linear-gradient(92deg, var(--accent) 10%, var(--accent-2) 55%, #818cf8 105%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .dd-hero-sub {
          margin-top: 1.25rem;
          max-width: 33rem;
          font-size: 1.075rem;
          color: var(--text-muted);
        }

        .dd-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          margin-top: 2.1rem;
        }

        .dd-hero-visual {
          position: relative;
        }

        .dd-preview {
          position: relative;
          max-width: 520px;
          margin: 0 auto;
        }

        .dd-preview-glow {
          position: absolute;
          inset: -8% -6%;
          background: radial-gradient(48% 48% at 50% 45%, rgba(34, 211, 238, 0.22), transparent 70%);
          filter: blur(28px);
          pointer-events: none;
        }

        .dd-window {
          position: relative;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-strong);
          background: linear-gradient(180deg, rgba(17, 26, 43, 0.94), rgba(9, 14, 26, 0.96));
          box-shadow:
            0 30px 60px -24px rgba(0, 0, 0, 0.75),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .dd-window-bar {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.7rem 1rem;
          border-bottom: 1px solid var(--border);
        }

        .dd-window-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: rgba(148, 163, 184, 0.28);
        }

        .dd-window-dot:first-child {
          background: rgba(34, 211, 238, 0.75);
        }

        .dd-window-title {
          margin-left: 0.5rem;
          flex: 1;
          font-size: 0.72rem;
          color: var(--text-faint);
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dd-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(52, 211, 153, 0.4);
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .dd-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: dd-blink 1.6s ease-in-out infinite;
        }

        @keyframes dd-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .dd-viewport {
          position: relative;
          aspect-ratio: 16 / 10.5;
          background:
            radial-gradient(70% 70% at 50% 42%, #101a2e 0%, #0a1120 68%, #070d19 100%);
          overflow: hidden;
        }

        .dd-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        .dd-face {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -52%);
          width: 34%;
          aspect-ratio: 0.78;
          border-radius: 46%;
          border: 1.5px solid rgba(34, 211, 238, 0.4);
          background: radial-gradient(58% 58% at 50% 40%, rgba(34, 211, 238, 0.09), transparent 75%);
          box-shadow: 0 0 34px -6px rgba(34, 211, 238, 0.35), inset 0 0 24px rgba(34, 211, 238, 0.07);
        }

        .dd-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid var(--accent);
          filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.8));
        }

        .dd-corner-tl { top: -7px; left: -7px; border-right: 0; border-bottom: 0; border-top-left-radius: 6px; }
        .dd-corner-tr { top: -7px; right: -7px; border-left: 0; border-bottom: 0; border-top-right-radius: 6px; }
        .dd-corner-bl { bottom: -7px; left: -7px; border-right: 0; border-top: 0; border-bottom-left-radius: 6px; }
        .dd-corner-br { bottom: -7px; right: -7px; border-left: 0; border-top: 0; border-bottom-right-radius: 6px; }

        .dd-eye {
          position: absolute;
          top: 34%;
          width: 17%;
          height: 9%;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.9);
          transform-origin: center;
          animation: dd-eye-blink 4.2s ease-in-out infinite;
        }

        .dd-eye-left { left: 22%; }
        .dd-eye-right { right: 22%; }

        @keyframes dd-eye-blink {
          0%, 91%, 100% { transform: scaleY(1); }
          94% { transform: scaleY(0.08); }
          97% { transform: scaleY(1); }
        }

        .dd-mouth {
          position: absolute;
          bottom: 22%;
          left: 50%;
          transform: translateX(-50%);
          width: 22%;
          height: 5%;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.55);
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }

        .dd-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 64px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(34, 211, 238, 0.16) 62%,
            rgba(34, 211, 238, 0.55) 98%,
            rgba(103, 232, 249, 0.95) 100%
          );
          animation: dd-scan 3.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @keyframes dd-scan {
          0% { top: -12%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { top: 104%; opacity: 0; }
        }

        .dd-hud-chip {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.32rem 0.7rem;
          border-radius: 999px;
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(7, 13, 25, 0.78);
          backdrop-filter: blur(6px);
          color: var(--accent);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .dd-hud-top { top: 12%; right: 7%; }
        .dd-hud-bottom { bottom: 12%; left: 7%; color: #67e8f9; }

        .dd-metrics {
          display: grid;
          gap: 0.55rem;
          padding: 1rem 1.1rem 1.15rem;
          border-top: 1px solid var(--border);
        }

        .dd-metric {
          display: grid;
          grid-template-columns: 2.4rem 1fr 2.6rem;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
        }

        .dd-metric-label {
          color: var(--text-faint);
          font-weight: 700;
        }

        .dd-metric-value {
          color: var(--text-muted);
          font-weight: 600;
          text-align: right;
        }

        .dd-metric-bar {
          height: 5px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.14);
          overflow: hidden;
        }

        .dd-metric-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
        }

        .dd-metric-fill-dim {
          background: linear-gradient(90deg, rgba(148, 163, 184, 0.5), rgba(148, 163, 184, 0.75));
          box-shadow: none;
        }

        .dd-float-card {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.95rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: rgba(13, 20, 36, 0.88);
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 36px -18px rgba(0, 0, 0, 0.8);
          animation: dd-float 6s ease-in-out infinite;
        }

        .dd-float-card strong {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .dd-float-card span + div > span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .dd-float-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: var(--accent);
          background: var(--accent-soft);
          border: 1px solid rgba(34, 211, 238, 0.35);
        }

        .dd-float-card-top { top: -22px; right: -14px; animation-delay: 0.6s; }

        @keyframes dd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .dd-section {
          padding: clamp(3.5rem, 8vw, 5.75rem) 0;
        }

        .dd-stats-section {
          padding-top: 0;
        }

        .dd-section-head {
          max-width: 38rem;
          margin: 0 auto clamp(2.25rem, 5vw, 3.25rem);
          text-align: center;
        }

        .dd-eyebrow {
          display: inline-block;
          margin-bottom: 0.85rem;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .dd-section-head h2,
        .dd-trust-copy h2 {
          font-family: var(--font-display);
          font-size: clamp(1.7rem, 3.4vw, 2.35rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .dd-section-head p {
          margin-top: 0.85rem;
          color: var(--text-muted);
          font-size: 1rem;
        }

        .dd-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .dd-stat-card {
          padding: 1.6rem 1.4rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015));
          backdrop-filter: blur(10px);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .dd-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(34, 211, 238, 0.4);
          box-shadow: 0 20px 40px -22px rgba(34, 211, 238, 0.4);
        }

        .dd-stat-value {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 3vw, 2.3rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(120deg, #f8fafc 30%, var(--accent));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        .dd-stat-card dd {
          margin: 0.55rem 0 0;
        }

        .dd-stat-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }

        .dd-stat-detail {
          display: block;
          margin-top: 0.2rem;
          font-size: 0.78rem;
          color: var(--text-faint);
        }

        .dd-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          padding: 0;
          list-style: none;
          counter-reset: step;
        }

        .dd-steps::before {
          content: '';
          position: absolute;
          top: 44px;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.45), transparent);
        }

        .dd-step {
          position: relative;
          text-align: center;
          padding: 0.75rem 1.1rem 1.4rem;
        }

        .dd-step-icon {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          border-radius: 22px;
          color: var(--accent);
          background:
            linear-gradient(180deg, rgba(17, 26, 43, 0.95), rgba(10, 16, 30, 0.95));
          border: 1px solid rgba(34, 211, 238, 0.3);
          box-shadow:
            0 0 26px -6px rgba(34, 211, 238, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.07);
        }

        .dd-step-index {
          position: absolute;
          top: -8px;
          right: -10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #04121a;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .dd-step h3 {
          margin-top: 1.15rem;
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 600;
        }

        .dd-step p {
          margin: 0.55rem auto 0;
          max-width: 17.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .dd-features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.1rem;
        }

        .dd-feature-card {
          padding: 1.6rem 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-raised);
          backdrop-filter: blur(10px);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease,
            background-color 0.25s ease;
        }

        .dd-feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(34, 211, 238, 0.4);
          background: rgba(34, 211, 238, 0.045);
          box-shadow: 0 22px 44px -24px rgba(34, 211, 238, 0.45);
        }

        .dd-feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          color: var(--accent);
          background: var(--accent-soft);
          border: 1px solid rgba(34, 211, 238, 0.3);
        }

        .dd-feature-card h3 {
          margin-top: 1.1rem;
          font-size: 1.02rem;
          font-weight: 600;
        }

        .dd-feature-card p {
          margin-top: 0.5rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .dd-trust {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: clamp(2.5rem, 5vw, 4.5rem);
          align-items: center;
          padding: clamp(2rem, 5vw, 3.25rem);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background:
            radial-gradient(60% 90% at 90% 10%, rgba(34, 211, 238, 0.08), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.008));
        }

        .dd-trust-lede {
          margin-top: 1.1rem;
          max-width: 32rem;
          color: var(--text-muted);
          font-size: 1rem;
        }

        .dd-trust-list {
          display: grid;
          gap: 1.1rem;
          margin-top: 1.9rem;
          padding: 0;
          list-style: none;
        }

        .dd-trust-list li {
          display: flex;
          gap: 0.95rem;
        }

        .dd-trust-point-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          color: var(--accent);
          background: var(--accent-soft);
          border: 1px solid rgba(34, 211, 238, 0.3);
        }

        .dd-trust-list strong {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .dd-trust-list p {
          margin-top: 0.2rem;
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        /* Alert simulation card */
        .dd-alert-card {
          max-width: 400px;
          margin: 0 auto;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(251, 113, 133, 0.35);
          background: linear-gradient(180deg, rgba(30, 18, 27, 0.92), rgba(16, 11, 20, 0.95));
          box-shadow:
            0 0 60px -18px rgba(251, 113, 133, 0.4),
            0 30px 60px -30px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }

        .dd-alert-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.2rem;
          border-bottom: 1px solid rgba(251, 113, 133, 0.22);
          color: var(--danger);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .dd-alert-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--danger);
          box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.55);
          animation: dd-pulse-ring-red 1.6s ease-out infinite;
        }

        @keyframes dd-pulse-ring-red {
          0% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.55); }
          70% { box-shadow: 0 0 0 9px rgba(251, 113, 133, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
        }

        .dd-alert-body {
          padding: 2.1rem 1.5rem 1.7rem;
          text-align: center;
        }

        .dd-alert-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 66px;
          height: 66px;
          border-radius: 50%;
          color: var(--danger);
          background: rgba(251, 113, 133, 0.1);
          border: 1px solid rgba(251, 113, 133, 0.4);
          box-shadow: 0 0 34px -4px rgba(251, 113, 133, 0.5);
        }

        .dd-alert-body p {
          margin-top: 1.15rem;
          color: #fecdd3;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .dd-waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 30px;
          margin-top: 1.3rem;
        }

        .dd-waveform span {
          width: 4px;
          border-radius: 999px;
          background: rgba(251, 113, 133, 0.85);
          animation: dd-wave 1.1s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.12s);
        }

        .dd-waveform span:nth-child(even) {
          height: 55%;
        }

        .dd-waveform span:nth-child(odd) {
          height: 100%;
        }

        @keyframes dd-wave {
          0%, 100% { transform: scaleY(0.35); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        .dd-footer {
          margin-top: auto;
          border-top: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent);
        }

        .dd-footer-top {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
          gap: 2.5rem;
          padding: 3.25rem 0 2.5rem;
        }

        .dd-footer-brand p {
          margin-top: 1rem;
          max-width: 22rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .dd-footer-links h3 {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .dd-footer-links ul {
          display: grid;
          gap: 0.6rem;
          margin-top: 1.1rem;
          padding: 0;
          list-style: none;
        }

        .dd-footer-links a {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .dd-footer-links a:hover {
          color: var(--accent);
        }

        .dd-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1.4rem 0 1.8rem;
          border-top: 1px solid var(--border);
        }

        .dd-footer-bottom p {
          font-size: 0.82rem;
          color: var(--text-faint);
        }

        .dd-footer-source {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .dd-footer-source:hover {
          color: var(--accent);
        }

        .dd-animate-up {
          opacity: 0;
          transform: translateY(18px);
          animation: dd-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0ms);
        }

        @keyframes dd-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--d, 0ms);
        }

        [data-reveal].dd-is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .dd-animate-up,
          [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }

          .dd-scanline,
          .dd-eye,
          .dd-float-card,
          .dd-waveform span,
          .dd-live-dot,
          .dd-badge-dot,
          .dd-alert-dot {
            animation: none !important;
          }
        }

       @media (max-width: 1024px) {
          .dd-hero-inner {
            grid-template-columns: 1fr;
            gap: 4rem;
          }

          .dd-hero-copy {
            text-align: center;
          }

          .dd-hero-sub {
            margin-left: auto;
            margin-right: auto;
          }

          .dd-hero-actions {
            justify-content: center;
          }

          .dd-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dd-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dd-trust {
            grid-template-columns: 1fr;
          }

          .dd-trust-visual {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .dd-nav-links {
            display: none;
          }

          .dd-nav-actions .dd-btn {
            display: none;
          }

          .dd-menu-toggle {
            display: inline-flex;
          }

          .dd-mobile-menu {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .dd-mobile-menu {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .dd-stats-grid,
          .dd-features-grid,
          .dd-steps {
            grid-template-columns: 1fr;
          }

          .dd-steps {
            gap: 2rem;
          }

          .dd-steps::before {
            display: none;
          }

          .dd-hero-actions .dd-btn {
            width: 100%;
          }

          .dd-float-card {
            display: none;
          }

          .dd-footer-top {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2.5rem 0 2rem;
          }

          .dd-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .dd-trust {
            padding: 1.75rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
