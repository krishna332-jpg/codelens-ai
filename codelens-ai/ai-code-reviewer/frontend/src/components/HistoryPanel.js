import React, { useState, useEffect } from 'react';
import { getHistory, deleteReview } from '../utils/api';

export default function HistoryPanel({ onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shareId) => {
    try {
      await deleteReview(shareId);
      setReviews(reviews.filter(r => r.shareId !== shareId));
    } catch {
      setError('Failed to delete');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#2ed573';
    if (score >= 60) return '#ffa502';
    return '#ff4757';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal history-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>📋 Review History</h2>

        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && reviews.length === 0 && (
          <p className="empty-state">No reviews yet. Start by pasting some code!</p>
        )}

        <div className="history-list">
          {reviews.map((r) => (
            <div key={r.shareId} className="history-item">
              <div className="history-item-left">
                <span className="lang-tag">{r.language}</span>
                <span className="history-summary">{r.review?.summary?.slice(0, 80)}...</span>
                <span className="history-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="history-item-right">
                <span className="history-score" style={{ color: getScoreColor(r.review?.score) }}>
                  {r.review?.score}
                </span>
                <button className="delete-btn" onClick={() => handleDelete(r.shareId)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
