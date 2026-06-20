import React, { useState } from 'react';

const SEVERITY_COLOR = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};

const ScoreRing = ({ score }) => {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const progress = circ - (score / 100) * circ;
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div className="score-ring-wrapper">
      <svg className="score-ring" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="7"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={progress} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
        <text x="55" y="51" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="Inter">{score}</text>
        <text x="55" y="66" textAnchor="middle" fill="rgba(0,0,0,0.3)" fontSize="9" fontFamily="Inter" letterSpacing="1">SCORE</text>
      </svg>
    </div>
  );
};

const IssueCard = ({ issue, index }) => (
  <div className="issue-card" style={{borderLeftColor: SEVERITY_COLOR[issue.severity] || '#111', animationDelay:`${index * 0.05}s`}}>
    <div className="issue-header">
      {issue.severity && <span className="severity-badge" style={{background: SEVERITY_COLOR[issue.severity]}}>{issue.severity}</span>}
      {issue.line && <span className="line-badge">Line {issue.line}</span>}
    </div>
    <p className="issue-message">{issue.message}</p>
    {issue.suggestion && (
      <div className="issue-suggestion">
        <span style={{color:'#16a34a',flexShrink:0,marginTop:'1px'}}>→</span>
        {issue.suggestion}
      </div>
    )}
  </div>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function ReviewResult({ result, language, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { review } = result;

  const tabs = [
    { id: 'overview',    label: 'Overview' },
    { id: 'bugs',        label: 'Bugs (' + (review.bugs?.length || 0) + ')' },
    { id: 'security',    label: 'Security (' + (review.security?.length || 0) + ')' },
    { id: 'performance', label: 'Performance (' + (review.performance?.length || 0) + ')' },
    { id: 'practices',   label: 'Best Practices (' + (review.bestPractices?.length || 0) + ')' },
  ];

  const totalIssues = (review.bugs?.length||0) + (review.security?.length||0) + (review.performance?.length||0) + (review.bestPractices?.length||0);

  return (
    <div className="result-page">
      <div className="result-topbar">
        <button className="back-btn" onClick={onBack}><BackIcon /> New review</button>
        <span className="lang-tag">{language}</span>
      </div>

      <div className="result-layout">
        <div className="result-hero">
          <ScoreRing score={review.score || 0} />
          <div className="result-summary">
            <h2>Review Complete</h2>
            <p className="summary-text">{review.summary}</p>
            <div className="stats-row">
              <div className="stat"><span>{totalIssues}</span><span className="stat-label">Issues</span></div>
              <div className="stat critical"><span>{review.bugs?.filter(b => b.severity === 'critical').length || 0}</span><span className="stat-label">Critical</span></div>
              <div className="stat good"><span>{review.positives?.length || 0}</span><span className="stat-label">Positives</span></div>
            </div>
          </div>
        </div>

        <div className="result-right">
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab.id} className={'tab' + (activeTab === tab.id ? ' active' : '')} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div>
                {review.positives?.length > 0 && (
                  <div className="positives-section">
                    <h3>What's working well</h3>
                    <ul>{review.positives.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                {totalIssues === 0 ? <div className="perfect-code">No issues found — excellent code quality.</div> : (
                  <div className="overview-issues">
                    <h3>Issues by category</h3>
                    {[['bugs','Bugs'],['security','Security'],['performance','Performance'],['bestPractices','Best Practices']].map(([cat, label]) => {
                      const items = review[cat]; if (!items?.length) return null;
                      const tabId = cat === 'bestPractices' ? 'practices' : cat;
                      return (
                        <div key={cat} className="overview-category" onClick={() => setActiveTab(tabId)}>
                          <span>{label}</span><span className="issue-count">{items.length}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'bugs' && <div className="issues-list">{review.bugs?.length > 0 ? review.bugs.map((b,i) => <IssueCard key={i} issue={b} index={i}/>) : <div className="no-issues">No bugs detected</div>}</div>}
            {activeTab === 'security' && <div className="issues-list">{review.security?.length > 0 ? review.security.map((s,i) => <IssueCard key={i} issue={s} index={i}/>) : <div className="no-issues">No security issues</div>}</div>}
            {activeTab === 'performance' && <div className="issues-list">{review.performance?.length > 0 ? review.performance.map((p,i) => <IssueCard key={i} issue={p} index={i}/>) : <div className="no-issues">No performance issues</div>}</div>}
            {activeTab === 'practices' && <div className="issues-list">{review.bestPractices?.length > 0 ? review.bestPractices.map((p,i) => <IssueCard key={i} issue={p} index={i}/>) : <div className="no-issues">All best practices followed</div>}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
