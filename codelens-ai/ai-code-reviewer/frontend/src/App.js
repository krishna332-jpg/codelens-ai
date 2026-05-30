import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ReviewPage from './pages/ReviewPage';
import AuthModal from './components/AuthModal';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

function AppInner() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showHistory, setShowHistory] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">CodeLens<span className="logo-ai">AI</span></span>
          </div>
          <p className="tagline">Instant AI-Powered Code Review</p>
        </div>
        <div className="header-right">
          <button className="theme-btn" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <button className="nav-btn" onClick={() => setShowHistory(true)}>
                📋 History
              </button>
              <span className="user-badge">👤 {user.name}</span>
              <button className="nav-btn logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>
                Login
              </button>
              <button className="nav-btn primary" onClick={() => { setAuthMode('register'); setShowAuth(true); }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <ReviewPage />
      </main>

      {showAuth && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuth(false)}
        />
      )}
      {showHistory && (
        <HistoryPanel onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
