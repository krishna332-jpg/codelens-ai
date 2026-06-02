import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ReviewPage from './pages/ReviewPage';
import AuthModal from './components/AuthModal';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function AppInner() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showHistory, setShowHistory] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="logo">
          <img
            src="/site%20logo.jpg"
            alt="CodeLens"
            style={{width:'36px',height:'36px',borderRadius:'9px',objectFit:'cover',boxShadow:'0 4px 16px rgba(240,77,26,0.3)'}}
          />
          <span className="logo-text">Code<span>Lens</span></span>
        </div>
        <div className="header-right">
          <button className="theme-btn" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          {user ? (
            <>
              <button className="nav-btn" onClick={() => setShowHistory(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <ClockIcon /> History
              </button>
              <span className="user-badge">{user.name}</span>
              <button className="nav-btn logout" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Log in</button>
              <button className="nav-btn primary" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>Sign up</button>
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
