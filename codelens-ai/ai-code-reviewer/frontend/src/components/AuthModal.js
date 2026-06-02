import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ mode, setMode, onClose }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className="modal-sub">
          {mode === 'login' ? 'Sign in to access your review history' : 'Free account — no credit card required'}
        </p>
        {mode === 'register' && (
          <input className="form-input" type="text" placeholder="Your name" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />
        )}
        <input className="form-input" type="email" placeholder="Email address" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} />
        <input className="form-input" type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        {error && <p className="error-msg">{error}</p>}
        <button className="review-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <p className="modal-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
