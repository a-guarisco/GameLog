import { useEffect, useRef } from 'react';
import { syncDevicePushToken } from './pushNotificationService';

/**
 * Hook that triggers synchronization of the device push token with the backend
 * whenever an authenticated user ID is available.
 * Ensures the check and registration run only once per user login session.
 */
export const useDeviceNotificationSync = (userId?: string): void => {
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      syncedUserIdRef.current = null;
      return;
    }

    if (syncedUserIdRef.current === userId) {
      return;
    }

    syncedUserIdRef.current = userId;
    syncDevicePushToken(userId).catch((err) => {
      console.warn('[useDeviceNotificationSync] Failed to sync push token:', err);
    });
  }, [userId]);
};
