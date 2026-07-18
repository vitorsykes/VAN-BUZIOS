/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Helper to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Helper to sign in anonymously
export const signInAnonymously = async () => {
  try {
    const result = await firebaseSignInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Error signing in anonymously", error);
    throw error;
  }
};

// Guarantee a unique ID for users even if authentication is blocked or fails
export const getUserId = (): string => {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  
  let localId = localStorage.getItem('van_local_uid');
  if (!localId) {
    localId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('van_local_uid', localId);
  }
  return localId;
};

