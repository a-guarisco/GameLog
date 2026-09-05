import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import {
  getStoredRegistration,
  requestAndRegisterPushToken,
  unregisterPushToken,
  initNotificationChannel,
} from '@gamelog/notifications';
import { Box } from '@gamelog/common/gluestack/box';
import { Button, ButtonText } from '@gamelog/common/button';
import { ErrorBox, InfoBox } from '@gamelog/common/feedbacks';

interface FirebaseDeviceNotificationTestProps {
  className?: string;
}

export const FirebaseDeviceNotificationTest = ({
  className = '',
}: FirebaseDeviceNotificationTestProps) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkRegistration = async () => {
      try {
        const stored = await getStoredRegistration();
        const { status } = await Notifications.getPermissionsAsync();

        if (status === 'granted') {
          await initNotificationChannel();
          const tokenData = await Notifications.getDevicePushTokenAsync();
          if (isMounted && tokenData?.data) {
            setFcmToken(tokenData.data);
            setRegisteredUserId(stored.userId);
            if (stored.token === tokenData.data) {
              setStatusMessage(
                `Device synced with Backend & Storage!\nOwner: ${stored.userId || 'N/A'}`
              );
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : 'Error checking registration');
        }
      }
    };

    checkRegistration();

    // Listen for FCM push token refreshes from Google Play Services / Expo
    const tokenSub = Notifications.addPushTokenListener(async (tokenData) => {
      if (tokenData.data && isMounted) {
        setFcmToken(tokenData.data);
        const user = getFirebaseAuth().currentUser;
        if (user) {
          try {
            await requestAndRegisterPushToken(user.uid);
            setRegisteredUserId(user.uid);
            setStatusMessage(
              `FCM Token refreshed & synced with Backend & Storage!\nToken: ${tokenData.data}`
            );
          } catch (err: unknown) {
            setErrorMessage(
              err instanceof Error ? err.message : 'Error syncing refreshed FCM device token'
            );
          }
        }
      }
    });

    return () => {
      isMounted = false;
      tokenSub.remove();
    };
  }, []);

  const handleRegisterDevice = async () => {
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const user = getFirebaseAuth().currentUser;
      const res = await requestAndRegisterPushToken(user?.uid);
      if (res.success && res.token) {
        setFcmToken(res.token);
        setRegisteredUserId(user?.uid ?? null);
        setStatusMessage(
          `Device successfully registered with Backend & Local Storage!\nOwner: ${user?.uid || 'anonymous'}\nToken: ${res.token}`
        );
      } else {
        throw new Error(res.error || 'Failed to register push token');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error registering device token');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregisterDevice = async () => {
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await unregisterPushToken(fcmToken || undefined);
      if (res.success) {
        setStatusMessage(
          'Device token successfully unregistered from Backend & Local Storage cleared!'
        );
        setFcmToken(null);
        setRegisteredUserId(null);
      } else {
        throw new Error(res.error || 'Failed to unregister device token');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error unregistering device token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={`gap-2.5 ${className}`}>
      <InfoBox
        message={
          fcmToken
            ? `Active Device FCM Token:\n${fcmToken}\n\nRegistered Owner (Local Storage):\n${registeredUserId || 'None'}`
            : 'No device registered yet for push notifications.'
        }
      />

      <Box className="flex-row gap-2">
        <Button
          isOnCard
          variant="solid"
          action="primary"
          onPress={handleRegisterDevice}
          isDisabled={loading}
          className="flex-1"
          testID="dev-register-device-btn"
        >
          <ButtonText>{loading ? 'Registering...' : 'Register Device (FCM)'}</ButtonText>
        </Button>

        <Button
          isOnCard
          variant="outline"
          action="negative"
          onPress={handleUnregisterDevice}
          isDisabled={loading || !fcmToken}
          className="flex-1"
          testID="dev-unregister-device-btn"
        >
          <ButtonText>{loading ? 'Unregistering...' : 'Unregister Device'}</ButtonText>
        </Button>
      </Box>

      {statusMessage ? <InfoBox message={statusMessage} /> : null}
      {errorMessage ? <ErrorBox errorMessage={errorMessage} /> : null}
    </Box>
  );
};
