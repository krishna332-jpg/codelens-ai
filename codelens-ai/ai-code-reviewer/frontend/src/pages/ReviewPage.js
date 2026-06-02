import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { reviewCode } from '../utils/api';
import ReviewResult from '../components/ReviewResult';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', logo: 'javascript-removebg-preview.png' },
  { id: 'typescript', label: 'TypeScript', logo: 'typescript-removebg-preview.png' },
  { id: 'python', label: 'Python', logo: 'python-removebg-preview.png' },
  { id: 'java', label: 'Java', logo: 'java-removebg-preview.png' },
  { id: 'cpp', label: 'C++', logo: 'cpp-removebg-preview.png' },
  { id: 'go', label: 'Go', logo: 'go-removebg-preview.png' },
  { id: 'rust', label: 'Rust', logo: 'rust-removebg-preview.png' },
  { id: 'php', label: 'PHP', logo: 'php-removebg-preview.png' },
  { id: 'ruby', label: 'Ruby', logo: 'ruby-removebg-preview.png' },
  { id: 'kotlin', label: 'Kotlin', logo: 'kotlin-removebg-preview.png' },
  { id: 'html', label: 'HTML', logo: 'html-removebg-preview.png' },
  { id: 'css', label: 'CSS', logo: 'css-removebg-preview.png' },
  { id: 'sql', label: 'SQL', logo: 'sql-removebg-preview.png' },
];

const SAMPLE_CODE = `function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  const result = db.execute(query);
  
  var data = []
  for (var i = 0; i < result.length; i++) {
    data.push(result[i])
  }
  return data
}

var password = "admin123"
var apiKey = "sk-1234567890abcdef"`;

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--accent)',marginBottom:'16px'}}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function ReviewPage({ onAuthRequired }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const currentLang = LANGUAGES.find(l => l.id === language);

  const handleReview = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!code.trim()) return setError('Please paste some code first.');
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await reviewCode(code, language);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Review failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <ReviewResult result={result} code={code} language={language} onBack={() => setResult(null)} />;
  }

  return (
    <div className="review-page">
      <div className="editor-section">
        <div className="editor-header">
          <h1 className="editor-title">
            Paste your code.<br />
            <span className="gradient-text">Get instant AI review.</span>
          </h1>
          <p className="editor-subtitle">Detects bugs, security issues, performance problems & best practice violations.</p>
        </div>

        <div className="lang-pills">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              className={`lang-pill ${language === lang.id ? 'active' : ''}`}
              onClick={() => setLanguage(lang.id)}
            >
              <img src={`/${lang.logo}`} alt={lang.label} onError={e => e.target.style.display='none'} />
              {lang.label}
            </button>
          ))}
        </div>

        {!user ? (
          <div className="auth-wall">
            <LockIcon />
            <h3>Sign in to review your code</h3>
            <p>Create a free account to get instant AI-powered code reviews,<br />track your history, and improve your code quality.</p>
            <div className="auth-wall-btns">
              <button className="nav-btn primary" onClick={onAuthRequired}>Get started free</button>
              <button className="nav-btn" onClick={onAuthRequired}>Log in</button>
            </div>
          </div>
        ) : (
          <>
            <div className="editor-controls">
              <div className="lang-select-wrapper">
                {currentLang && (
                  <img
                    src={`/${currentLang.logo}`}
                    alt={currentLang.label}
                    className="lang-select-icon"
                    onError={e => e.target.style.display='none'}
                  />
                )}
                <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <button className="ctrl-btn" onClick={() => { setCode(SAMPLE_CODE); setResult(null); setError(''); }}>Load sample</button>
              {code && <button className="ctrl-btn" onClick={() => { setCode(''); setResult(null); setError(''); }}>Clear</button>}
            </div>

            <div className="editor-wrapper">
              <div className="editor-line-numbers">
                {(code || ' ').split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}
              </div>
              <textarea
                className="code-editor"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`// Paste your ${currentLang?.label || language} code here...\n// CodeLens AI will analyze:\n// — Bugs & errors\n// — Security vulnerabilities\n// — Performance issues\n// — Best practice violations`}
                spellCheck={false}
              />
            </div>

            <div className="editor-footer">
              <span className="char-count">{code.length.toLocaleString()} / 20,000</span>
              {error && <p className="error-msg">{error}</p>}
              <button
                className="review-btn"
                onClick={handleReview}
                disabled={loading || !code.trim()}
              >
                {loading ? <><span className="spinner" /> Analyzing...</> : <>Review Code <ArrowRightIcon /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
