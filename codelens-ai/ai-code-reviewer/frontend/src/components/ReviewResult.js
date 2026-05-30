import React, { useState } from 'react';

const SEVERITY_COLOR = {
  critical: '#ff4757',
  high: '#ff6b35',
  medium: '#ffa502',
  low: '#2ed573',
};

const ScoreRing = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = circ - (score / 100) * circ;
  const color = score >= 80 ? '#2ed573' : score >= 60 ? '#ffa502' : '#ff4757';

  return (
    <div className="score-ring-wrapper">
      <svg className="score-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="65" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold">{score}</text>
      </svg>
      <span className="score-label">Quality Score</span>
    </div>
  );
};

const IssueCard = ({ issue, type }) => (
  <div className="issue-card" style={{ borderLeftColor: SEVERITY_COLOR[issue.severity] || '#7f8c8d' }}>
    <div className="issue-header">
      {issue.severity && (
        <span className="severity-badge" style={{ background: SEVERITY_COLOR[issue.severity] }}>
          {issue.severity.toUpperCase()}
        </span>
      )}
      {issue.line && <span className="line-badge">Line {issue.line}</span>}
    </div>
    <p className="issue-message">{issue.message}</p>
    {issue.suggestion && (
      <div className="issue-suggestion">
        <span>💡</span> {issue.suggestion}
      </div>
    )}
  </div>
);

export default function ReviewResult({ result, code, language, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const { review, shareId } = result;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'bugs', label: `🐛 Bugs (${review.bugs?.length || 0})` },
    { id: 'security', label: `🔐 Security (${review.security?.length || 0})` },
    { id: 'performance', label: `⚡ Performance (${review.performance?.length || 0})` },
    { id: 'practices', label: `📐 Best Practices (${review.bestPractices?.length || 0})` },
  ];

  const handleShare = () => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalIssues =
    (review.bugs?.length || 0) +
    (review.security?.length || 0) +
    (review.performance?.length || 0) +
    (review.bestPractices?.length || 0);

  return (
    <div className="result-page">
      <div className="result-topbar">
        <button className="back-btn" onClick={onBack}>← New Review</button>
        <div className="topbar-right">
          <span className="lang-tag">{language}</span>
          {shareId && (
            <button className="share-btn" onClick={handleShare}>
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>
          )}
        </div>
      </div>

      <div className="result-hero">
        <ScoreRing score={review.score || 0} />
        <div className="result-summary">
          <h2>Review Complete</h2>
          <p className="summary-text">{review.summary}</p>
          <div className="stats-row">
            <div className="stat"><span>{totalIssues}</span>Total Issues</div>
            <div className="stat critical"><span>{review.bugs?.filter(b => b.severity === 'critical').length || 0}</span>Critical</div>
            <div className="stat good"><span>{review.positives?.length || 0}</span>Positives</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {review.positives?.length > 0 && (
              <div className="positives-section">
                <h3>✅ What's Good</h3>
                <ul>
                  {review.positives.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            {totalIssues === 0 && (
              <div className="perfect-code">
                <p>🎉 No issues found! Great code quality.</p>
              </div>
            )}
            {totalIssues > 0 && (
              <div className="overview-issues">
                <h3>Issues Summary</h3>
                {['bugs', 'security', 'performance', 'bestPractices'].map(cat => {
                  const items = review[cat];
                  if (!items?.length) return null;
                  const labels = { bugs: '🐛 Bugs', security: '🔐 Security', performance: '⚡ Performance', bestPractices: '📐 Best Practices' };
                  return (
                    <div key={cat} className="overview-category" onClick={() => setActiveTab(cat === 'bestPractices' ? 'practices' : cat)}>
                      <span>{labels[cat]}</span>
                      <span className="issue-count">{items.length}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bugs' && (
          <div className="issues-list">
            {review.bugs?.length > 0
              ? review.bugs.map((b, i) => <IssueCard key={i} issue={b} type="bug" />)
              : <div className="no-issues">✅ No bugs detected!</div>}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="issues-list">
            {review.security?.length > 0
              ? review.security.map((s, i) => <IssueCard key={i} issue={s} type="security" />)
              : <div className="no-issues">✅ No security issues detected!</div>}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="issues-list">
            {review.performance?.length > 0
              ? review.performance.map((p, i) => <IssueCard key={i} issue={p} type="performance" />)
              : <div className="no-issues">✅ No performance issues detected!</div>}
          </div>
        )}

        {activeTab === 'practices' && (
          <div className="issues-list">
            {review.bestPractices?.length > 0
              ? review.bestPractices.map((p, i) => <IssueCard key={i} issue={p} type="practice" />)
              : <div className="no-issues">✅ All best practices followed!</div>}
          </div>
        )}
      </div>
    </div>
  );
}
