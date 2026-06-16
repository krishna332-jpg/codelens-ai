import React, { useState, useEffect } from 'react';
import { getHistory, deleteReview } from '../utils/api';

export default function HistoryPanel({ onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try { const res = await getHistory(); setReviews(res.data); }
    catch { setError('Failed to load history'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (shareId) => {
    try { await deleteReview(shareId); setReviews(reviews.filter(r => r.shareId !== shareId)); }
    catch { setError('Failed to delete'); }
  };

  const getScoreColor = (score) => score >= 80 ? '#1fd97a' : score >= 60 ? '#ffc542' : '#ff3d57';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal history-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Review History</h2>
        <p className="modal-sub">All your past code reviews</p>
        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && reviews.length === 0 && (
          <p className="empty-state">No reviews yet. Start by reviewing some code!</p>
        )}
        <div className="history-list">
          {reviews.map(r => (
            <div key={r.shareId} className="history-item">
              <div className="history-item-left">
                <span className="lang-tag" style={{alignSelf:'flex-start',marginBottom:'4px'}}>{r.language}</span>
                <span className="history-summary">{r.review?.summary?.slice(0, 90)}...</span>
                <span className="history-date">{new Date(r.createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</span>
              </div>
              <div className="history-item-right">
                <span className="history-score" style={{color: getScoreColor(r.review?.score)}}>{r.review?.score}</span>
                <button className="delete-btn" onClick={() => handleDelete(r.shareId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
