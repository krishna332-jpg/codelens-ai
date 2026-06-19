import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgYHAGwXucg6I97HEzRxJ35vkIlYNgP7k",
  authDomain: "codelens-ai-ab48f.firebaseapp.com",
  projectId: "codelens-ai-ab48f",
  storageBucket: "codelens-ai-ab48f.firebasestorage.app",
  messagingSenderId: "767224218761",
  appId: "1:767224218761:web:76eb6575e3b2df57c2b258",
  measurementId: "G-D6CKXBVCR2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const firebaseSignOut = () => signOut(auth);
