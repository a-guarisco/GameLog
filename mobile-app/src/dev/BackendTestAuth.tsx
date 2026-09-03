import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { useState } from 'react';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { ErrorBox, LoadingBox, SuccessBox } from '@gamelog/common/feedbacks';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

interface BackendTestAuthProps {
  className?: string;
}

const AUTH_TEST_TIMEOUT_MS = 8000;

export const BackendTestAuth = ({ className }: BackendTestAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);

  const testAuthEndpoint = async () => {
    if (isLoading) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TEST_TIMEOUT_MS);

    try {
      setIsLoading(true);
      setStatusMessage(null);
      setErrorMessage(null);

      // Fetch live token from active user session
      const currentUser = getFirebaseAuth().currentUser;
      const token = currentUser ? await currentUser.getIdToken() : null;

      if (!token) {
        throw new Error('No active user session. Click "Generate Firebase Token" first.');
      }

      const nextUrl = EndPoints.getAuthOutcome();
      setRequestUrl(nextUrl);

      const response = await fetch(nextUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setStatusMessage('Authorized (200 OK)');
        return;
      }

      if (response.status === 401) {
        throw new Error('Unauthorized (401) - Token rejected by backend');
      }

      throw new Error(`Unexpected HTTP status: ${response.status}`);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setErrorMessage(`Timeout after ${AUTH_TEST_TIMEOUT_MS / 1000}s`);
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <Box className={`w-full max-w-[320px] gap-2 self-center ${className ?? ''}`}>
      <Button isOnCard onPress={testAuthEndpoint} isDisabled={isLoading}>
        <ButtonText>Test Backend Auth</ButtonText>
      </Button>
      {isLoading ? <LoadingBox message="Testing getFirebaseAuth() endpoint..." /> : null}
      {statusMessage ? (
        <SuccessBox
          message={`Auth test result: ${statusMessage}${requestUrl ? ` (${requestUrl})` : ''}`}
        />
      ) : null}
      {errorMessage ? (
        <ErrorBox
          errorMessage={`Auth test failed: ${errorMessage}${requestUrl ? ` (${requestUrl})` : ''}`}
        />
      ) : null}
      <Text className="text-xs text-typography-100">
        Uses active logged in Firebase session (persisted via AsyncStorage).
      </Text>
    </Box>
  );
};
