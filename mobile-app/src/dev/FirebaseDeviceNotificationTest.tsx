import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import apiManager from '@gamelog/api-manager/apiManager';
import { Box } from '@gamelog/common/gluestack/box';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { SuccessBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';

// Configure notifications handler: shouldShowAlert = false as requested, so real OS system notifications handle closed/background app states
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

interface FirebaseDeviceNotificationTestProps {
  className?: string;
}

export const FirebaseDeviceNotificationTest = ({
  className = '',
}: FirebaseDeviceNotificationTestProps) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Check permissions and sync existing token if already granted
    Notifications.getPermissionsAsync().then(async ({ status }) => {
      if (status === 'granted') {
        try {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Default Channel',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }
          const tokenData = await Notifications.getDevicePushTokenAsync();
          if (isMounted && tokenData.data) {
            setFcmToken(tokenData.data);
            await apiManager.registerDeviceToken(tokenData.data, Platform.OS);
            setStatusMessage(`Device synced with Backend!\nToken: ${tokenData.data}`);
          }
        } catch {
          // Silent catch for initial background check
        }
      } else {
        if (isMounted) setStatusMessage('Notification permissions not yet granted');
      }
    });

    // Listen for FCM push token refreshes from Google Play Services / Expo
    const tokenSub = Notifications.addPushTokenListener(async (tokenData) => {
      if (tokenData.data) {
        setFcmToken(tokenData.data);
        try {
          await apiManager.registerDeviceToken(tokenData.data, Platform.OS);
          setStatusMessage(`FCM Token refreshed & synced with Backend!\nToken: ${tokenData.data}`);
        } catch (err: unknown) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Error syncing refreshed FCM device token'
          );
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
      // 1. Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission to receive push notifications was denied.');
      }

      // 2. Configure Android channel if on Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Channel',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // 3. Get native FCM Device Token
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const deviceToken = tokenData.data;
      setFcmToken(deviceToken);

      // 4. Register FCM Token with backend
      await apiManager.registerDeviceToken(deviceToken, Platform.OS);
      setStatusMessage(`Device successfully registered with Backend!\nToken: ${deviceToken}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error registering device token');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregisterDevice = async () => {
    if (!fcmToken) {
      setErrorMessage('No active FCM token found to unregister.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await apiManager.unregisterDeviceToken(fcmToken);
      setStatusMessage('Device token successfully unregistered from Backend!');
      setFcmToken(null);
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
            ? `Active Device FCM Token:\n${fcmToken}`
            : 'No device registered yet for push notifications.'
        }
      />

      <Box className="flex-row gap-2">
        <Button
          onPress={handleRegisterDevice}
          isDisabled={loading}
          className="flex-1 bg-primary-600"
        >
          <ButtonText>{loading ? 'Registering...' : 'Register Device (FCM)'}</ButtonText>
        </Button>

        <Button
          onPress={handleUnregisterDevice}
          isDisabled={loading || !fcmToken}
          variant="outline"
          className="flex-1 border-error-600"
        >
          <ButtonText className="text-error-600">
            {loading ? 'Unregistering...' : 'Unregister Device'}
          </ButtonText>
        </Button>
      </Box>

      {statusMessage ? <SuccessBox message={statusMessage} /> : null}
      {errorMessage ? <ErrorBox errorMessage={errorMessage} /> : null}
    </Box>
  );
};
