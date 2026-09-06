import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import apiManager from '@gamelog/api-manager/apiManager';
import {
  initNotificationChannel,
  getStoredRegistration,
  saveStoredRegistration,
  clearStoredRegistration,
  requestAndRegisterPushToken,
  unregisterPushToken,
  syncDevicePushToken,
  NOTIFICATION_STORAGE_KEYS,
} from '../../src/notifications/pushNotificationService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getDevicePushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('@gamelog/api-manager/apiManager', () => ({
  registerDeviceToken: jest.fn(),
  unregisterDeviceToken: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: jest.fn(() => ({
    currentUser: { uid: 'test-firebase-uid' },
  })),
}));

describe('pushNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Helpers', () => {
    it('getStoredRegistration returns token and userId from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN)
          return Promise.resolve('fcm-token-123');
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID)
          return Promise.resolve('user-456');
        return Promise.resolve(null);
      });

      const result = await getStoredRegistration();
      expect(result).toEqual({ token: 'fcm-token-123', userId: 'user-456' });
    });

    it('saveStoredRegistration saves both token and userId to AsyncStorage', async () => {
      await saveStoredRegistration('fcm-token-123', 'user-456');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN,
        'fcm-token-123'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID,
        'user-456'
      );
    });

    it('clearStoredRegistration removes keys from AsyncStorage', async () => {
      await clearStoredRegistration();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID
      );
    });

    it('initNotificationChannel sets default channel on android', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';
      await initNotificationChannel();
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
        expect.objectContaining({ name: 'Default Channel' })
      );
      Platform.OS = originalOS;
    });
  });

  describe('requestAndRegisterPushToken', () => {
    it('registers token successfully when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'fcm-device-token-abc',
      });
      (apiManager.registerDeviceToken as jest.Mock).mockResolvedValue({
        id: '1',
        device_token: 'fcm-device-token-abc',
      });

      const res = await requestAndRegisterPushToken('user-1');

      expect(res.success).toBe(true);
      expect(res.token).toBe('fcm-device-token-abc');
      expect(apiManager.registerDeviceToken).toHaveBeenCalledWith(
        'fcm-device-token-abc',
        expect.any(String)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN,
        'fcm-device-token-abc'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID,
        'user-1'
      );
    });

    it('requests permission if existingStatus is not granted and registers if accepted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'fcm-token-new',
      });

      const res = await requestAndRegisterPushToken('user-1');

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.token).toBe('fcm-token-new');
      expect(apiManager.registerDeviceToken).toHaveBeenCalledWith(
        'fcm-token-new',
        expect.any(String)
      );
    });

    it('returns success: false without throwing if user denies permission', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const res = await requestAndRegisterPushToken('user-1');

      expect(res.success).toBe(false);
      expect(res.error).toBe('Permission not granted');
      expect(apiManager.registerDeviceToken).not.toHaveBeenCalled();
    });

    it('falls back to getFirebaseAuth currentUser uid if userId is omitted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'fcm-token-auto-user',
      });

      const res = await requestAndRegisterPushToken();

      expect(res.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID,
        'test-firebase-uid'
      );
    });
  });

  describe('unregisterPushToken', () => {
    it('unregisters provided token from backend and clears local storage', async () => {
      await unregisterPushToken('fcm-token-to-delete');
      expect(apiManager.unregisterDeviceToken).toHaveBeenCalledWith('fcm-token-to-delete');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID
      );
    });

    it('unregisters token from storage if not explicitly provided', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN)
          return Promise.resolve('stored-fcm-token');
        return Promise.resolve(null);
      });

      await unregisterPushToken();
      expect(apiManager.unregisterDeviceToken).toHaveBeenCalledWith('stored-fcm-token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN
      );
    });
  });

  describe('syncDevicePushToken', () => {
    it('skips network call if device is already registered for current user with identical token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN)
          return Promise.resolve('existing-token');
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID)
          return Promise.resolve('user-same');
        return Promise.resolve(null);
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'existing-token',
      });

      const res = await syncDevicePushToken('user-same');

      expect(res.synced).toBe(true);
      expect(res.token).toBe('existing-token');
      expect(apiManager.registerDeviceToken).not.toHaveBeenCalled();
    });

    it('re-registers token in backend and updates storage when a different user logs in on same device', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_TOKEN)
          return Promise.resolve('existing-token');
        if (key === NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID)
          return Promise.resolve('previous-user-id');
        return Promise.resolve(null);
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'existing-token',
      });

      const res = await syncDevicePushToken('new-user-id');

      expect(res.synced).toBe(true);
      expect(apiManager.registerDeviceToken).toHaveBeenCalledWith(
        'existing-token',
        expect.any(String)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_STORAGE_KEYS.ACTIVE_DEVICE_USER_ID,
        'new-user-id'
      );
    });

    it('triggers requestAndRegisterPushToken when status is undetermined', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'new-token' });

      const res = await syncDevicePushToken('user-undetermined');

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(res.synced).toBe(true);
      expect(apiManager.registerDeviceToken).toHaveBeenCalledWith('new-token', expect.any(String));
    });

    it('returns synced: false when permission is denied', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const res = await syncDevicePushToken('user-denied');

      expect(res.synced).toBe(false);
      expect(apiManager.registerDeviceToken).not.toHaveBeenCalled();
    });
  });
});
