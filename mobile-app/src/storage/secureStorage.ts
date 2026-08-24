import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo-modules-core';

export const SECURE_STORAGE_KEYS = {
  STEAM_API_KEY: 'gamelog_steam_api_key',
} as const;

let secureStoreModule: typeof import('expo-secure-store') | null | undefined = undefined;

const getSecureStore = (): typeof import('expo-secure-store') | null => {
  if (Platform.OS === 'web') {
    return null;
  }
  if (secureStoreModule !== undefined) {
    return secureStoreModule;
  }
  try {
    const nativeModule = requireOptionalNativeModule('ExpoSecureStore');
    if (nativeModule) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      secureStoreModule = require('expo-secure-store');
      return secureStoreModule;
    }
  } catch {
    // Graceful fallback if native module cannot be loaded
  }
  secureStoreModule = null;
  return null;
};

/**
 * Checks if hardware/OS secure storage is available on the current platform and device.
 */
export const isSecureStoreAvailable = async (): Promise<boolean> => {
  const store = getSecureStore();
  if (!store) {
    return false;
  }
  try {
    return await store.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * Stores a key-value pair securely using Keychain (iOS) or KeyStore (Android),
 * falling back to AsyncStorage if native secure store is not compiled in the running binary.
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    const store = getSecureStore();
    const isAvailable = store ? await store.isAvailableAsync().catch(() => false) : false;
    if (isAvailable && store) {
      await store.setItemAsync(key, value, {
        keychainAccessible: store.WHEN_UNLOCKED,
      });
    } else {
      await AsyncStorage.setItem(`@secure_${key}`, value);
    }
  } catch (error) {
    console.warn(`[SecureStore] Failed to save item for key "${key}":`, error);
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const store = getSecureStore();
    const isAvailable = store ? await store.isAvailableAsync().catch(() => false) : false;
    if (isAvailable && store) {
      const val = await store.getItemAsync(key, {
        keychainAccessible: store.WHEN_UNLOCKED,
      });
      if (val !== null) {
        return val;
      }
    }
    return await AsyncStorage.getItem(`@secure_${key}`);
  } catch (error) {
    console.warn(`[SecureStore] Failed to get item for key "${key}":`, error);
    return null;
  }
};

export const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    const store = getSecureStore();
    const isAvailable = store ? await store.isAvailableAsync().catch(() => false) : false;
    if (isAvailable && store) {
      await store.deleteItemAsync(key, {
        keychainAccessible: store.WHEN_UNLOCKED,
      });
    }
    await AsyncStorage.removeItem(`@secure_${key}`);
  } catch (error) {
    console.warn(`[SecureStore] Failed to delete item for key "${key}":`, error);
  }
};

export const setSecureSteamApiKey = async (apiKey: string): Promise<void> => {
  if (!apiKey) {
    await deleteSecureSteamApiKey();
  } else {
    await setSecureItem(SECURE_STORAGE_KEYS.STEAM_API_KEY, apiKey);
  }
};

export const getSecureSteamApiKey = async (): Promise<string | null> => {
  return await getSecureItem(SECURE_STORAGE_KEYS.STEAM_API_KEY);
};

export const deleteSecureSteamApiKey = async (): Promise<void> => {
  await deleteSecureItem(SECURE_STORAGE_KEYS.STEAM_API_KEY);
};

export const clearAllSecureStorage = async (): Promise<void> => {
  await Promise.all(Object.values(SECURE_STORAGE_KEYS).map((key) => deleteSecureItem(key)));
};
