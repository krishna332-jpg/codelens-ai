import React, { useState } from 'react';
import { reviewCode } from '../utils/api';
import ReviewResult from '../components/ReviewResult';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql'
];

const SAMPLE_CODE = {
  javascript: `function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  const result = db.execute(query);
  
  var data = []
  for (var i = 0; i < result.length; i++) {
    data.push(result[i])
  }
  
  return data
}`,
  python: `def calculate_average(numbers):
  total = 0
  for i in range(len(numbers)):
    total = total + numbers[i]
  avg = total / len(numbers)
  return avg

print(calculate_average([]))`,
};

export default function ReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleReview = async () => {
    if (!code.trim()) return setError('Please paste some code first.');
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await reviewCode(code, language);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Review failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const sample = SAMPLE_CODE[language] || SAMPLE_CODE.javascript;
    setCode(sample);
    setResult(null);
    setError('');
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setError('');
  };

  return (
    <div className="review-page">
      {!result ? (
        <div className="editor-section">
          <div className="editor-header">
            <h1 className="editor-title">
              Paste your code.<br />
              <span className="gradient-text">Get instant AI review.</span>
            </h1>
            <p className="editor-subtitle">
              Detects bugs, security issues, performance problems & best practice violations.
            </p>
          </div>

          <div className="editor-controls">
            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
            <button className="sample-btn" onClick={loadSample}>Load Sample</button>
            {code && <button className="clear-btn" onClick={handleClear}>Clear</button>}
          </div>

          <div className="editor-wrapper">
            <div className="editor-line-numbers">
              {(code || ' ').split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Paste your ${language} code here...\n// CodeLens AI will analyze it for:\n// • Bugs & errors\n// • Security vulnerabilities\n// • Performance issues\n// • Best practice violations`}
              spellCheck={false}
            />
          </div>

          <div className="editor-footer">
            <span className="char-count">{code.length.toLocaleString()} / 20,000 chars</span>
            {error && <p className="error-msg">⚠️ {error}</p>}
            <button
              className={`review-btn ${loading ? 'loading' : ''}`}
              onClick={handleReview}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <><span className="spinner" /> Analyzing...</>
              ) : (
                <><span>⬡</span> Review Code</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <ReviewResult
          result={result}
          code={code}
          language={language}
          onBack={() => setResult(null)}
        />
      )}
    </div>
  );
}
