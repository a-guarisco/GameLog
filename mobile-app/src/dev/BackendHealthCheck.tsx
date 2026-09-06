import { useState } from 'react';
import { Button, ButtonText } from '@gamelog/common/button';
import { ErrorBox, LoadingBox, SuccessBox } from '@gamelog/common/feedbacks';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

interface BackendHealthCheckProps {
  className?: string;
}

const HEALTHCHECK_TIMEOUT_MS = 8000;

export const BackendHealthCheck = ({ className }: BackendHealthCheckProps) => {
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthUrl, setHealthUrl] = useState<string | null>(null);

  const checkBackendHealth = async () => {
    if (isHealthLoading) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);

    try {
      setIsHealthLoading(true);
      setHealthError(null);
      setHealthStatus(null);

      const nextHealthUrl = EndPoints.getBackendHealth();
      setHealthUrl(nextHealthUrl);

      const response = await fetch(nextHealthUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { status?: string };
      setHealthStatus(data.status ?? 'unknown');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setHealthError(
          `Timeout after ${HEALTHCHECK_TIMEOUT_MS / 1000}s. DEV-TIP: set EXPO_PUBLIC_BACKEND_BASE_URL to your host LAN IP (for example http://192.168.x.x:8000).`
        );
      } else {
        setHealthError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsHealthLoading(false);
    }
  };

  return (
    <>
      <Button
        isOnCard
        variant="solid"
        action="primary"
        onPress={checkBackendHealth}
        isDisabled={isHealthLoading}
        className={className}
      >
        <ButtonText>Check Backend Health</ButtonText>
      </Button>

      {isHealthLoading ? <LoadingBox message="Checking backend health..." /> : null}
      {healthStatus ? (
        <SuccessBox
          message={`Backend health: ${healthStatus}${healthUrl ? ` (${healthUrl})` : ''}`}
        />
      ) : null}
      {healthError ? (
        <ErrorBox
          errorMessage={`Backend health failed: ${healthError}${healthUrl ? ` (${healthUrl})` : ''}`}
        />
      ) : null}
    </>
  );
};
