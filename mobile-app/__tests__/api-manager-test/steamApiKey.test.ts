import {
  setSteamApiKey,
  getSteamApiKey,
  clearSteamApiKey,
  initSteamApiKeyFromStorage,
  setSteamId,
  getSteamId,
} from '@gamelog/api-manager/steamApiKey';
import * as secureStorage from '@gamelog/storage/secureStorage';

describe('steamApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSteamApiKey('', false);
    setSteamId('');
  });

  afterEach(() => {
    setSteamApiKey('', false);
    setSteamId('');
  });

  describe('Steam API Key', () => {
    it('sets and gets the Steam API key in memory without persisting if persist=false', () => {
      const setSecureSpy = jest.spyOn(secureStorage, 'setSecureSteamApiKey');
      setSteamApiKey('test_api_key_123', false);
      expect(getSteamApiKey()).toBe('test_api_key_123');
      expect(setSecureSpy).not.toHaveBeenCalled();
      setSecureSpy.mockRestore();
    });

    it('saves API key to secure storage when setSteamApiKey is called with persist=true', async () => {
      const setSecureSpy = jest.spyOn(secureStorage, 'setSecureSteamApiKey').mockResolvedValue();
      setSteamApiKey('new_key_123', true);
      expect(getSteamApiKey()).toBe('new_key_123');
      expect(setSecureSpy).toHaveBeenCalledWith('new_key_123');
      setSecureSpy.mockRestore();
    });

    it('handles error when persisting API key fails', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const setSecureSpy = jest
        .spyOn(secureStorage, 'setSecureSteamApiKey')
        .mockRejectedValueOnce(new Error('Persistence failed'));
      setSteamApiKey('failed_persist_key', true);
      // Wait for promise rejection handling
      await Promise.resolve();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
      setSecureSpy.mockRestore();
    });

    it('clears API key from memory and secure storage when clearSteamApiKey is called', async () => {
      const deleteSecureSpy = jest.spyOn(secureStorage, 'deleteSecureSteamApiKey').mockResolvedValue();
      setSteamApiKey('key_to_delete', false);
      await clearSteamApiKey();
      expect(getSteamApiKey()).toBe('');
      expect(deleteSecureSpy).toHaveBeenCalled();
      deleteSecureSpy.mockRestore();
    });

    it('warns and returns empty string if API key is not set', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(getSteamApiKey()).toBe('');
      expect(warnSpy).toHaveBeenCalledWith('STEAM API key is not set. Please update your profile or sign in.');
      warnSpy.mockRestore();
    });

    it('initializes API key from secure storage if present', async () => {
      jest.spyOn(secureStorage, 'getSecureSteamApiKey').mockResolvedValueOnce('persisted_secret_key');
      const loaded = await initSteamApiKeyFromStorage();
      expect(loaded).toBe('persisted_secret_key');
      expect(getSteamApiKey()).toBe('persisted_secret_key');
    });

    it('returns null if no API key is in secure storage', async () => {
      jest.spyOn(secureStorage, 'getSecureSteamApiKey').mockResolvedValueOnce(null);
      const loaded = await initSteamApiKeyFromStorage();
      expect(loaded).toBeNull();
    });

    it('handles error in initSteamApiKeyFromStorage gracefully', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(secureStorage, 'getSecureSteamApiKey').mockRejectedValueOnce(new Error('Storage failure'));
      const loaded = await initSteamApiKeyFromStorage();
      expect(loaded).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('Steam ID', () => {
    it('sets and gets the Steam ID', () => {
      setSteamId('76561198000000000');
      expect(getSteamId()).toBe('76561198000000000');
    });
  });
});
