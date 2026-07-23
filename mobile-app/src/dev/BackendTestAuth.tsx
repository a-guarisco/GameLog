import { auth } from '@gamelog/auth/firebaseClient';
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

      // Try fetching live token from active user session first, fallback to env token
      const currentUser = auth.currentUser;
      const liveToken = currentUser ? await currentUser.getIdToken() : null;
      const token = liveToken || (process.env.EXPO_PUBLIC_TEST_BEARER_TOKEN ?? '');

      if (!token) {
        throw new Error('No active user token or EXPO_PUBLIC_TEST_BEARER_TOKEN');
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

      // Template status handling for the current backend behavior.
      if (response.status === 200) {
        setStatusMessage('ok');
        return;
      }

      if (response.status === 401) {
        setStatusMessage('unauthorized');
        return;
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
      <Button onPress={testAuthEndpoint} isDisabled={isLoading}>
        <ButtonText>Test Backend Auth</ButtonText>
      </Button>
      {isLoading ? <LoadingBox message="Testing auth endpoint..." /> : null}
      {statusMessage ? (
        <SuccessBox
          message={`Auth test result: ${statusMessage}${requestUrl ? ` (${requestUrl})` : ''}`}
        />
      ) : null}
      {errorMessage ? <ErrorBox errorMessage={errorMessage} /> : null}
      <Text className="text-xs text-typography-300">
        Uses active logged in Firebase session (persisted via AsyncStorage) or
        EXPO_PUBLIC_TEST_BEARER_TOKEN.
      </Text>
    </Box>
  );
};
