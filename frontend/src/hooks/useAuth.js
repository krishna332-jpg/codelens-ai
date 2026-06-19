import { createContext, useContext, useState, useEffect } from 'react';
import { auth, firebaseSignOut } from '../firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleFirebaseUser = async (firebaseUser) => {
    if (!firebaseUser) return;
    const userData = {
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      uid: firebaseUser.uid,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    try {
      const res = await axios.post(API_URL + '/api/auth/google', {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (e) {
      console.log('Backend sync skipped, using Firebase auth');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleFirebaseUser(firebaseUser);
      } else {
        const stored = localStorage.getItem('user');
        if (!stored) setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    try { await firebaseSignOut(); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
