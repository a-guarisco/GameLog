import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, ButtonText } from '@gamelog/common/button';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { ErrorBox, LoadingBox, SuccessBox } from '@gamelog/common/feedbacks';

interface FirebaseTokenGeneratorProps {
  className?: string;
}

const email = process.env.EXPO_PUBLIC_TOKEN_GEN_EMAIL || '';
const pwd = process.env.EXPO_PUBLIC_TOKEN_GEN_PASSWORD || '';

export const FirebaseTokenGenerator = ({ className }: FirebaseTokenGeneratorProps) => {
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
    setIdToken(null);
    try {
      if (!email || !pwd) {
        throw new Error(
          'EXPO_PUBLIC_TOKEN_GEN_EMAIL or EXPO_PUBLIC_TOKEN_GEN_PASSWORD missing in .env'
        );
      }

      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, pwd);
      const token = await credential.user.getIdToken(true);
      setIdToken(token);
      console.log('Generated Firebase ID Token:', token);
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={`w-full max-w-[320px] gap-2 self-center ${className ?? ''}`}>
      <Button
        isOnCard
        variant="solid"
        action="primary"
        onPress={generateToken}
        isDisabled={isLoading}
      >
        <ButtonText>Generate Firebase Token</ButtonText>
      </Button>

      {isLoading ? <LoadingBox message="Generating Firebase token..." /> : null}

      {idToken ? (
        <>
          <SuccessBox message="Firebase token generated successfully!" />
          <Button
            isOnCard
            variant="outline"
            action="secondary"
            onPress={() => setShowToken(!showToken)}
          >
            <ButtonText>{showToken ? 'Hide Token' : 'Show Token'}</ButtonText>
          </Button>

          {showToken ? (
            <Text className="break-all text-xs font-mono text-typography-100">{idToken}</Text>
          ) : null}
        </>
      ) : null}

      {error ? <ErrorBox errorMessage={error} /> : null}
    </Box>
  );
};
