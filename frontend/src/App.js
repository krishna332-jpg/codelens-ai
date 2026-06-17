]import React, { useState, useEffect, useRef } from 'react';
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
    const CHARS = 'function main(){this.pos.x=lerp(a,b,t);const vel=new Vec2();if(dist<radius){applyForce(dx,dy);}return result.score;var gravity=0.3;damping*=0.99;p.x+=vx;p.y+=vy+g;spring.solve();node.update(delta);}reviewCode(code,language);analyzeWithAI(prompt);class CodeLens{constructor(){this.api=new API();}}';
    const GRAVITY = 0.55;
    const DAMPING = 0.978;
    const SEGMENTS = 20;
    const MOUSE_RADIUS = 100;
    const MOUSE_STRENGTH = 22;
    const COL_SPACING = 18;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); buildStrings(); });

    class Point {
      constructor(x, y, pinned) {
        this.x = x; this.y = y; this.ox = x; this.oy = y;
        this.ax = 0; this.ay = 0; this.pinned = pinned;
      }
      update() {
        if (this.pinned) return;
        const vx = (this.x - this.ox) * DAMPING;
        const vy = (this.y - this.oy) * DAMPING;
        this.ox = this.x; this.oy = this.y;
        this.x += vx + this.ax;
        this.y += vy + this.ay + GRAVITY;
        this.ax = 0; this.ay = 0;
      }
      applyForce(fx, fy) { this.ax += fx; this.ay += fy; }
    }

    class Spring {
      constructor(p1, p2, len) { this.p1 = p1; this.p2 = p2; this.len = len; }
      solve() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const diff = (dist - this.len) / dist * 0.5;
        const ox = dx * diff, oy = dy * diff;
        if (!this.p1.pinned) { this.p1.x += ox; this.p1.y += oy; }
        if (!this.p2.pinned) { this.p2.x -= ox; this.p2.y -= oy; }
      }
    }

    class StringLine {
      constructor(x, charOffset) {
        this.x = x; this.charOffset = charOffset;
        this.segH = canvas.height / (SEGMENTS - 1);
        this.points = []; this.springs = [];
        for (let i = 0; i < SEGMENTS; i++)
          this.points.push(new Point(x, i * this.segH, i === 0));
        for (let i = 0; i < SEGMENTS - 1; i++)
          this.springs.push(new Spring(this.points[i], this.points[i+1], this.segH));
      }
      update(mx, my) {
        for (const p of this.points) {
          if (p.pinned) continue;
          const dx = p.x - mx, dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
            const angle = Math.atan2(dy, dx);
            p.applyForce(Math.cos(angle) * force, Math.sin(angle) * force);
          }
        }
        for (let i = 0; i < 5; i++) for (const s of this.springs) s.solve();
        for (const p of this.points) p.update();
      }
      draw() {
        const fontSize = Math.max(9, COL_SPACING * 0.72);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < this.points.length - 1; i++) {
          const p = this.points[i], pn = this.points[i+1];
          const angle = Math.atan2(pn.y - p.y, pn.x - p.x) - Math.PI / 2;
          const ch = CHARS[(this.charOffset + i) % CHARS.length];
          if (ch === ' ') continue;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);
          ctx.fillStyle = 'rgba(30,28,26,0.72)';
          ctx.fillText(ch, 0, 0);
          ctx.restore();
        }
      }
    }

    let strings = [];
    function buildStrings() {
      strings = [];
      const cols = Math.ceil(canvas.width / COL_SPACING) + 2;
      for (let i = 0; i < cols; i++)
        strings.push(new StringLine(i * COL_SPACING, (i * 7) % CHARS.length));
    }
    buildStrings();

    const mouse = { x: -9999, y: -9999 };
    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    function tick() {
      rafID = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of strings) { s.update(mouse.x, mouse.y); s.draw(); }
    }
    tick();

    return () => {
      cancelAnimationFrame(rafID);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return <canvas ref={canvasRef} id="cloth-canvas" />;
}

function AuthPage({ mode, setMode, onSuccess }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-brand">CodeLens</div>
        <p className="auth-tagline">AI-powered code review, instantly.</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log in</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Get started</button>
        </div>
        {mode === 'register' && (
          <>
            <label className="auth-label">Your name</label>
            <input className="auth-input" type="text" placeholder="e.g. Athul"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </>
        )}
        <label className="auth-label">Email</label>
        <input className="auth-input" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <label className="auth-label">Password</label>
        <input className="auth-input" type="password" placeholder="••••••••"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{marginBottom:0}} />
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <div className="auth-divider"><span>or</span></div>
        <button className="auth-google" onClick={() => alert('Google sign-in coming soon')}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = () => { logout(); setAuthMode('login'); };

  return (
    <div className="app">
      <ClothCanvas />
      {!user ? (
        <AuthPage mode={authMode} setMode={setAuthMode} onSuccess={() => {}} />
      ) : (
        <>
          <header className="header">
            <div className="logo">
              <span className="logo-text">Code<span>Lens</span></span>
            </div>
            <div className="header-right">
              <button className="history-btn" onClick={() => setShowHistory(true)}>
                <ClockIcon /> History
              </button>
              <span className="user-badge">{user.name}</span>
              <button className="nav-btn logout" onClick={handleLogout}>Sign out</button>
            </div>
          </header>
          <main>
            <ReviewPage />
          </main>
          {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
