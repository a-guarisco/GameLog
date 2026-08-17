import { useState } from 'react';
import { signInWithGoogle } from '@gamelog/auth/googleAuth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      // App state will automatically pick this up via onAuthStateChanged
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        setSuccessMsg('Account created! Please check your email to verify before logging in.');
        setIsSignUp(false); // Switch to login view
        auth.signOut(); // Force sign out until verified
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          auth.signOut();
          setErrorMsg('Please verify your email before logging in.');
        }
        // If verified, App state picks it up
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errorMsg,
    successMsg,
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    handleGoogleSignIn,
    handleEmailAuth,
  };
}
