import { useState } from 'react';
import { type User } from 'firebase/auth';

import { signInWithGoogle, signOutGoogle } from '@gamelog/auth/googleAuth';
import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { SuccessBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';

export const GoogleAuthTest = ({ className }: { className?: string }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUser, setLastUser] = useState<User | null>(getFirebaseAuth().currentUser);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const user = await signInWithGoogle();
      setLastUser(user);
      setSuccessMsg(
        `Google Sign-In Successful!\nDisplay Name: ${user.displayName || 'N/A'}\nEmail: ${user.email}\nUID: ${user.uid}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await signOutGoogle();
      setLastUser(null);
      setSuccessMsg('Signed out from Google Sign-In session.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '799231800910-ajjc418riuhph5ng7hko69qdifl418om.apps.googleusercontent.com';

  return (
    <Box className={`gap-2.5 ${className}`}>
      <InfoBox message={`Configured Web Client ID:\n${webClientId}\n\nPackage: com.gamelog.app`} />

      {lastUser ? (
        <Box className="p-2.5 rounded-md border border-outline-200 gap-1">
          <Text className="text-xs font-semibold text-typography-0">Current User Details:</Text>
          <Text className="text-xs text-typography-500">Name: {lastUser.displayName || 'N/A'}</Text>
          <Text className="text-xs text-typography-500">Email: {lastUser.email}</Text>
          <Text className="text-xs text-typography-500">UID: {lastUser.uid}</Text>
        </Box>
      ) : null}

      <Button onPress={handleGoogleSignIn} isDisabled={loading} className="w-full">
        <ButtonText>
          {loading ? 'Signing in with Google...' : 'Sign In with Google (OAuth2)'}
        </ButtonText>
      </Button>

      {lastUser ? (
        <Button
          onPress={handleGoogleSignOut}
          isDisabled={loading}
          variant="outline"
          className="w-full"
        >
          <ButtonText>Sign Out Google Account</ButtonText>
        </Button>
      ) : null}

      {successMsg ? <SuccessBox message={successMsg} /> : null}
      {errorMsg ? <ErrorBox errorMessage={errorMsg} /> : null}
    </Box>
  );
};
