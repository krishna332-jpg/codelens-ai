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

function ClothCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafID;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const CODE = `function reviewCode(code,language){const prompt=buildPrompt(code,language);const result=analyzeWithAI(prompt);return{score:result.score,bugs:result.bugs,security:result.security,performance:result.performance,bestPractices:result.bestPractices,summary:result.summary,positives:result.positives};}class CodeLens{constructor(){this.api=new API();this.auth=new Auth();}async review(code,lang){if(!this.auth.user)throw new Error("Login required");return await this.api.post("/review",{code,lang});}}`;

    const gridW = 40;
    const gridH = 20;
    const cellW = window.innerWidth / (gridW - 1);
    const cellH = window.innerHeight / (gridH - 1);
    const GRAVITY = 0.3;
    const DAMPING = 0.99;
    const ITERATIONS = 5;
    const MOUSE_RADIUS = 8000;
    const MOUSE_STRENGTH = 6;

    const fontSize = Math.max(10, cellH * 0.8);
    const charCanvases = {};
    for (const ch of new Set(CODE)) {
      if (ch === ' ') continue;
      const off = document.createElement('canvas');
      off.width = off.height = Math.ceil(fontSize * 1.5);
      const octx = off.getContext('2d');
      octx.font = `bold ${fontSize}px monospace`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = 'rgba(255,255,255,0.55)';
      octx.fillText(ch, off.width / 2, off.height / 2);
      charCanvases[ch] = off;
    }

    const particles = [];
    for (let j = 0; j < gridH; j++) {
      for (let i = 0; i < gridW; i++) {
        const idx = (i + j * gridW) % CODE.length;
        particles.push({
          x: i * cellW,
          y: j * cellH,
          ox: i * cellW,
          oy: j * cellH,
          ax: 0, ay: 0,
          pinned: j === 0,
          char: CODE[idx] || ' ',
          downConstraint: null,
        });
      }
    }

    const constraints = [];
    for (let j = 0; j < gridH; j++) {
      for (let i = 0; i < gridW; i++) {
        const p = particles[j * gridW + i];
        if (j < gridH - 1) {
          const b = particles[(j + 1) * gridW + i];
          const c = { p1: p, p2: b, len: cellH, min: cellH * 0.02, max: cellH * 1.1 };
          constraints.push(c);
          p.downConstraint = c;
        }
        if (i < gridW - 1) {
          const r = particles[j * gridW + (i + 1)];
          constraints.push({ p1: p, p2: r, len: cellW, min: cellW * 0.6, max: cellW * 4 });
        }
      }
    }

    const mouse = { x: -9999, y: -9999 };

    function onMove(e) {
      const touch = e.touches ? e.touches[0] : e;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    let last = 0;
    function tick(now) {
      rafID = requestAnimationFrame(tick);
      const delta = Math.min(now - last, 32);
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (p.pinned) { p.ax = 0; p.ay = 0; continue; }

        const vx = (p.x - p.ox) * DAMPING;
        const vy = (p.y - p.oy) * DAMPING;
        p.ox = p.x; p.oy = p.y;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < MOUSE_RADIUS) {
          const strength = (1 - dist2 / MOUSE_RADIUS) * MOUSE_STRENGTH / 300;
          const angle = Math.atan2(dy, dx);
          p.ax += Math.cos(angle) * strength;
          p.ay += Math.sin(angle) * strength;
        }

        p.ay += GRAVITY / 1000;
        const dd = (delta || 16) ** 2;
        p.x += vx + p.ax * dd * 0.001;
        p.y += vy + p.ay * dd * 0.001;
        p.ax = 0; p.ay = 0;
      }

      for (let it = 0; it < ITERATIONS; it++) {
        for (const c of constraints) {
          const dx = c.p2.x - c.p1.x;
          const dy = c.p2.y - c.p1.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          let target = c.len;
          if (dist < c.min) target = c.min;
          else if (dist > c.max) target = c.max;
          else continue;
          const pct = (target - dist) / dist / 2;
          const ox = dx * pct, oy = dy * pct;
          if (!c.p1.pinned) { c.p1.x -= ox; c.p1.y -= oy; }
          if (!c.p2.pinned) { c.p2.x += ox; c.p2.y += oy; }
        }
      }

      for (const p of particles) {
        if (!p.char || p.char === ' ') continue;
        const img = charCanvases[p.char];
        if (!img) continue;
        const half = img.width / 2;

        let cos = 1, sin = 0;
        if (p.downConstraint) {
          const dc = p.downConstraint;
          const ddx = dc.p2.x - dc.p1.x;
          const ddy = dc.p2.y - dc.p1.y;
          const angle = Math.atan2(ddy, ddx) - Math.PI / 2;
          cos = Math.cos(angle);
          sin = Math.sin(angle);
        }
        ctx.setTransform(cos, sin, -sin, cos, p.x, p.y);
        ctx.drawImage(img, -half, -half);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    rafID = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafID);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} id="cloth-canvas" />;
}

function AppInner() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="app">
      <ClothCanvas />

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
