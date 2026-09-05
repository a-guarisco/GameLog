import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import apiManager from '@gamelog/api-manager/apiManager';
import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';

export const NOTIFICATION_STORAGE_KEYS = {
  ACTIVE_DEVICE_TOKEN: '@gamelog_registered_device_token',
  ACTIVE_DEVICE_USER_ID: '@gamelog_registered_device_user_id',
} as const;

// Ensure default notifications behavior is configured
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Initializes the default notification channel for Android devices.
 */
export const initNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('[PushNotification] Error setting notification channel:', e);
    }
  }
};

/**
 * Retrieves the currently registered token and owner user ID from local storage.
 */
export const getStoredRegistration = async (): Promise<{
  token: string | null;
  userId: string | null;
}> => {
  try {
    const [token, userId] = await Promise.all([
      AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN),
      AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID),
    ]);
    return { token, userId };
  } catch {
    return { token: null, userId: null };
  }
};

/**
 * Persists the registered token and owner user ID into local storage.
 */
export const saveStoredRegistration = async (token: string, userId: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN, token),
      AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID, userId),
    ]);
  } catch (e) {
    console.warn('[PushNotification] Error saving stored registration:', e);
  }
};

/**
 * Clears the stored device token registration from local storage.
 */
export const clearStoredRegistration = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN),
      AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID),
    ]);
  } catch (e) {
    console.warn('[PushNotification] Error clearing stored registration:', e);
  }
};

/**
 * Requests native system notification permissions. If granted, retrieves the device push token,
 * registers it with the backend for the given userId, and updates local storage.
 * Gracefully handles permission denial or errors without throwing.
 */
/**
 * Requests native system notification permissions. If granted, retrieves the device push token,
 * registers it with the backend for the given userId, and updates local storage.
 * Gracefully handles permission denial or errors without throwing.
 */
export const requestAndRegisterPushToken = async (
  userId?: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const targetUserId = userId || getFirebaseAuth().currentUser?.uid;
    if (!targetUserId) {
      return { success: false, error: 'No authenticated user found' };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, error: 'Permission not granted' };
    }

    await initNotificationChannel();
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;

    if (!token) {
      return { success: false, error: 'No device token received' };
    }

    await apiManager.registerDeviceToken(token, Platform.OS);
    await saveStoredRegistration(token, targetUserId);

    return { success: true, token };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error registering device token';
    console.warn('[PushNotification] Failed to register push token:', errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Unregisters the device token from the backend and wipes local storage.
 */
export const unregisterPushToken = async (
  tokenToUnregister?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let token = tokenToUnregister;
    if (!token) {
      const stored = await getStoredRegistration();
      token = stored.token ?? undefined;
    }

    if (token) {
      await apiManager.unregisterDeviceToken(token);
    }
    await clearStoredRegistration();
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error unregistering device token';
    console.warn('[PushNotification] Failed to unregister device token:', errorMsg);
    await clearStoredRegistration();
    return { success: false, error: errorMsg };
  }
};

/**
 * Synchronizes the device push token on login or app resume:
 * - If permissions are granted, checks whether the stored registration matches the current user and token.
 *   If not, registers the token in the backend (which reassigns it to this user) and updates local storage.
 * - If permissions are undetermined, requests permission directly via the native system dialog.
 */
export const syncDevicePushToken = async (
  userId?: string
): Promise<{ synced: boolean; token?: string }> => {
  try {
    const targetUserId = userId || getFirebaseAuth().currentUser?.uid;
    if (!targetUserId) {
      return { synced: false };
    }

    const stored = await getStoredRegistration();
    const { status } = await Notifications.getPermissionsAsync();

    if (status === 'granted') {
      await initNotificationChannel();
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const currentToken = tokenData?.data;

      if (currentToken) {
        if (stored.userId !== targetUserId || stored.token !== currentToken) {
          await apiManager.registerDeviceToken(currentToken, Platform.OS);
          await saveStoredRegistration(currentToken, targetUserId);
        }
        return { synced: true, token: currentToken };
      }
    } else if (status === 'undetermined') {
      const result = await requestAndRegisterPushToken(targetUserId);
      return { synced: result.success, token: result.token };
    }

    return { synced: false };
  } catch (err) {
    console.warn('[PushNotification] Error syncing device token:', err);
    return { synced: false };
  }
};
