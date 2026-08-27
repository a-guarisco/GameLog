import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  SECURE_STORAGE_KEYS,
  isSecureStoreAvailable,
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
  setSecureSteamApiKey,
  getSecureSteamApiKey,
  deleteSecureSteamApiKey,
  clearAllSecureStorage,
} from '../../src/storage/secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('isSecureStoreAvailable', () => {
    it('returns true when SecureStore.isAvailableAsync is true on native platform', async () => {
      Platform.OS = 'ios';
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValueOnce(true);
      const available = await isSecureStoreAvailable();
      expect(available).toBe(true);
    });

    it('returns false when Platform.OS is web', async () => {
      Platform.OS = 'web';
      const available = await isSecureStoreAvailable();
      expect(available).toBe(false);
      expect(SecureStore.isAvailableAsync).not.toHaveBeenCalled();
    });

    it('returns false when SecureStore.isAvailableAsync throws', async () => {
      Platform.OS = 'android';
      (SecureStore.isAvailableAsync as jest.Mock).mockRejectedValueOnce(new Error('Hardware Keystore unavailable'));
      const available = await isSecureStoreAvailable();
      expect(available).toBe(false);
    });
  });

  describe('setSecureItem & getSecureItem & deleteSecureItem', () => {
    it('sets and gets item successfully', async () => {
      await setSecureItem('custom_key', 'custom_value');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'custom_key',
        'custom_value',
        expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED })
      );

      const val = await getSecureItem('custom_key');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        'custom_key',
        expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED })
      );
      expect(val).toBe('custom_value');
    });

    it('deletes item successfully', async () => {
      await deleteSecureItem('custom_key');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'custom_key',
        expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED })
      );
    });

    it('handles errors gracefully in setSecureItem without throwing', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Keychain Error'));

      await expect(setSecureItem('fail_key', 'val')).resolves.not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('handles errors gracefully in getSecureItem without throwing and returns null', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Keychain Read Error'));

      const result = await getSecureItem('fail_key');
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('handles errors gracefully in deleteSecureItem without throwing', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Keychain Delete Error'));

      await expect(deleteSecureItem('fail_key')).resolves.not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('does not call SecureStore and uses fallback storage when platform is web', async () => {
      Platform.OS = 'web';
      await setSecureItem('web_key', 'val');
      const val = await getSecureItem('web_key');
      expect(val).toBe('val');

      await deleteSecureItem('web_key');
      const deletedVal = await getSecureItem('web_key');
      expect(deletedVal).toBeNull();

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('Steam API Key helpers', () => {
    it('sets Steam API key when string is non-empty', async () => {
      await setSecureSteamApiKey('STEAM_KEY_12345');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_STORAGE_KEYS.STEAM_API_KEY,
        'STEAM_KEY_12345',
        expect.anything()
      );
    });

    it('deletes Steam API key when setSecureSteamApiKey is called with empty string', async () => {
      await setSecureSteamApiKey('');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_STORAGE_KEYS.STEAM_API_KEY,
        expect.anything()
      );
    });

    it('retrieves Steam API key', async () => {
      await setSecureSteamApiKey('STEAM_KEY_ABC');
      const retrieved = await getSecureSteamApiKey();
      expect(retrieved).toBe('STEAM_KEY_ABC');
    });

    it('deletes Steam API key explicitly', async () => {
      await deleteSecureSteamApiKey();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_STORAGE_KEYS.STEAM_API_KEY,
        expect.anything()
      );
    });

    it('clears all secure storage entries', async () => {
      await clearAllSecureStorage();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_STORAGE_KEYS.STEAM_API_KEY,
        expect.anything()
      );
    });
  });
});
