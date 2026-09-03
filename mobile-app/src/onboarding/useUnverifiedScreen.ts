import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { useAuthSession } from '@gamelog/auth/useAuthSession';

export function useUnverifiedScreen() {
  const { firebaseUser, checkEmailVerification } = useAuthSession();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCheckVerification = async () => {
    setLoading(true);
    setErrorCode(null);
    setSuccessMsg(null);
    try {
      await checkEmailVerification();
      // If the user is still not verified, checkEmailVerification will just reset authState to 'unverified'.
      // So we can show a manual error message here.
      if (getFirebaseAuth().currentUser && !getFirebaseAuth().currentUser.emailVerified) {
        setErrorCode('auth/unverified-email');
      }
    } catch (err: any) {
      console.error('Error during checkEmailVerification:', err);
      let code = err.code;
      if (!code && err.message) {
        const match = err.message.match(/\((auth\/[^)]+)\)/);
        if (match) code = match[1];
      }
      setErrorCode(code || 'auth/network-request-failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!firebaseUser) return;
    setResendLoading(true);
    setErrorCode(null);
    setSuccessMsg(null);
    try {
      await sendEmailVerification(firebaseUser);
      setSuccessMsg('Verification email sent again! Please check your inbox.');
    } catch (err: any) {
      setErrorCode(err.code || 'auth/network-request-failed');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    await getFirebaseAuth().signOut();
  };

  return {
    firebaseUser,
    loading,
    resendLoading,
    errorCode,
    successMsg,
    handleCheckVerification,
    handleResendEmail,
    handleSignOut,
  };
}
