import { useState } from 'react';
import { signInWithGoogle } from '@gamelog/auth/googleAuth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';

export type AuthMode = 'signin' | 'signup';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorCode(null);
    try {
      await signInWithGoogle();
      // App state will automatically pick this up via onAuthStateChanged
    } catch (err: any) {
      setErrorCode(err.code || 'auth/google-sign-in-failed');
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setErrorCode('auth/provider-setup-pending');
    setLoading(false);
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setErrorCode('auth/provider-setup-pending');
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorCode('validation/missing-fields');
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      setErrorCode('validation/password-mismatch');
      return;
    }

    setLoading(true);
    setErrorCode(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        // We do NOT sign out. onAuthStateChanged will route them to UnverifiedScreen.
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // We do NOT check emailVerified here and sign out.
        // onAuthStateChanged will pick up the user and route to UnverifiedScreen if needed.
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      
      let code = err.code;
      // Se Firebase lancia un errore senza .code (es. nell'emulatore), lo estraiamo dal messaggio
      if (!code && err.message) {
        const match = err.message.match(/\((auth\/[^)]+)\)/);
        if (match) code = match[1];
      }
      
      setErrorCode(code || 'auth/network-request-failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errorCode,
    successMsg,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    authMode,
    setAuthMode,
    isSignUp: authMode === 'signup',
    setIsSignUp: (val: boolean) => setAuthMode(val ? 'signup' : 'signin'),
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleGithubSignIn,
    handleEmailAuth,
  };
}
