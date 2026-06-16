import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const reviewCode = (code, language) =>
  API.post('/api/review', { code, language });

export const getHistory = () => API.get('/api/history');

export const deleteReview = (shareId) => API.delete(`/api/history/${shareId}`);

export const login = (email, password) =>
  API.post('/api/auth/login', { email, password });

export const register = (name, email, password) =>
  API.post('/api/auth/register', { name, email, password });

export default API;
