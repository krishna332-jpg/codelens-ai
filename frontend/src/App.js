
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ReviewPage from './pages/ReviewPage';
import AuthModal from './components/AuthModal';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ── Animated string/thread background ──
function StringCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate strings from all four corners into the canvas
    const NUM_STRINGS = 42;
    const strings = [];

    function makeString(i) {
      // Distribute anchor points across all 4 edges
      const edge = i % 4;
      let x0, y0;
      if (edge === 0) { x0 = (i / NUM_STRINGS) * W * 1.5; y0 = 0; }       // top
      else if (edge === 1) { x0 = W; y0 = (i / NUM_STRINGS) * H * 1.5; }   // right
      else if (edge === 2) { x0 = (i / NUM_STRINGS) * W * 1.5; y0 = H; }   // bottom
      else { x0 = 0; y0 = (i / NUM_STRINGS) * H * 1.5; }                   // left

      return {
        x0, y0,
        pts: Array.from({ length: 18 }, (_, j) => {
          const t = j / 17;
          // Endpoint: opposite corner area
          const xEnd = edge < 2 ? W * (0.3 + Math.random() * 0.7) : W * (Math.random() * 0.7);
          const yEnd = edge % 2 === 0 ? H * (0.3 + Math.random() * 0.7) : H * (Math.random() * 0.7);
          return {
            x: x0 + (xEnd - x0) * t + (Math.random() - 0.5) * 60,
            y: y0 + (yEnd - y0) * t + (Math.random() - 0.5) * 60,
            ox: 0, oy: 0, vx: 0, vy: 0,
          };
        }),
        opacity: 0.10 + Math.random() * 0.18,
        width: 0.4 + Math.random() * 0.7,
      };
    }

    for (let i = 0; i < NUM_STRINGS; i++) strings.push(makeString(i));

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    const TENSION = 0.3;
    const DAMPING = 0.78;
    const INFLUENCE = 110;
    const FORCE = 4.5;

    function tick() {
      ctx.clearRect(0, 0, W, H);

      for (const s of strings) {
        const pts = s.pts;
        const n = pts.length;

        // Physics
        for (let j = 0; j < n; j++) {
          const p = pts[j];
          const t = j / (n - 1);
          // Natural position along line
          const nx = s.x0 + (pts[n-1].ox - s.x0) * t;
          const ny = s.pts[0].oy;

          // spring toward natural pos
          const targetX = s.x0 + (W / 2 - s.x0) * t + p.ox;
          const targetY = s.y0 + (H / 2 - s.y0) * t + p.oy;

          const dist = Math.hypot(mouse.x - (s.x0 + (W*0.5 - s.x0)*t + p.x), mouse.y - (s.y0 + (H*0.5 - s.y0)*t + p.y));

          if (dist < INFLUENCE) {
            const angle = Math.atan2(
              (s.y0 + (H*0.5 - s.y0)*t + p.y) - mouse.y,
              (s.x0 + (W*0.5 - s.x0)*t + p.x) - mouse.x
            );
            const force = (1 - dist / INFLUENCE) * FORCE;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          p.vx += -p.x * TENSION * 0.05;
          p.vy += -p.y * TENSION * 0.05;
          p.vx *= DAMPING;
          p.vy *= DAMPING;
          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';

        const p0 = pts[0];
        const bx = s.x0 + p0.x;
        const by = s.y0 + p0.y;
        ctx.moveTo(bx, by);

        for (let j = 1; j < n - 1; j++) {
          const p = pts[j];
          const pn = pts[j + 1];
          const px = s.x0 + p.x + (j / n) * (W * 0.5 - s.x0);
          const py = s.y0 + p.y + (j / n) * (H * 0.5 - s.y0);
          const nx2 = s.x0 + pn.x + ((j+1)/n) * (W*0.5 - s.x0);
          const ny2 = s.y0 + pn.y + ((j+1)/n) * (H*0.5 - s.y0);
          ctx.quadraticCurveTo(px, py, (px + nx2) / 2, (py + ny2) / 2);
        }
        const pl = pts[n - 1];
        ctx.lineTo(
          s.x0 + pl.x + (W*0.5 - s.x0),
          s.y0 + pl.y + (H*0.5 - s.y0)
        );
        ctx.stroke();
      }

      animId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} id="string-canvas" />;
}

function AppInner() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="app">
      <StringCanvas />

      <header className="header">
        <div className="logo">
          <span className="logo-text">Code<span>Lens</span></span>
        </div>
        <div className="header-right">
          {user ? (
            <>
              <button className="history-btn" onClick={() => setShowHistory(true)}>
                <ClockIcon /> History
              </button>
              <span className="user-badge">{user.name}</span>
              <button className="nav-btn logout" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Log in</button>
              <button className="nav-btn" style={{background:'#fff',color:'#111',borderColor:'#fff'}}
                onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Get started</button>
            </>
          )}
        </div>
      </header>

      <main>
        <ReviewPage onAuthRequired={() => { setAuthMode('register'); setShowAuth(true); }} />
      </main>

      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuth(false)} />
      )}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
