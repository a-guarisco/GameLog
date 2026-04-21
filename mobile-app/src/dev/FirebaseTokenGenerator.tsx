import { auth } from '@gamelog/auth/firebaseClient';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { Text } from '@gamelog/common/gluestack/text';
import { ErrorBox } from '@gamelog/common/feedbacks/ErrorBox';

const email = process.env.EXPO_PUBLIC_TOKEN_GEN_EMAIL || '';
const pwd = process.env.EXPO_PUBLIC_TOKEN_GEN_PASSWORD || '';

export const FirebaseTokenGenerator = () => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const generateToken = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pwd);
      const token = await credential.user.getIdToken(true);
      setIdToken(token);
      console.log('Generated Firebase ID Token:', token);
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onPress={generateToken} disabled={isLoading}>
        {isLoading ? (
          <ButtonText>Generating...</ButtonText>
        ) : (
          <ButtonText>Generate Firebase Token</ButtonText>
        )}
      </Button>
      {idToken && (
        <Button onPress={() => setShowToken(!showToken)} className="mt-2">
          <ButtonText>Show Token</ButtonText>
        </Button>
      )}
      {showToken && idToken && <Text className="mt-2 break-all text-sm">{idToken}</Text>}
      {error && <ErrorBox className="mt-2" errorMessage={error} />}
    </>
  );
};
