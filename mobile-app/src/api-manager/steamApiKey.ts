import {
  setSecureSteamApiKey,
  getSecureSteamApiKey,
  deleteSecureSteamApiKey,
} from '@gamelog/storage/secureStorage';

let _dynamicSteamApiKey = '';
let _dynamicSteamId = '';

export const setSteamApiKey = (key: string, persist: boolean = true) => {
  _dynamicSteamApiKey = key;
  if (persist) {
    setSecureSteamApiKey(key).catch((err) => {
      console.warn('Failed to persist Steam API key securely:', err);
    });
  }
};

export const clearSteamApiKey = async () => {
  _dynamicSteamApiKey = '';
  await deleteSecureSteamApiKey();
};

export const initSteamApiKeyFromStorage = async (): Promise<string | null> => {
  try {
    const storedKey = await getSecureSteamApiKey();
    if (storedKey) {
      _dynamicSteamApiKey = storedKey;
      return storedKey;
    }
  } catch (err) {
    console.warn('Failed to load Steam API key from secure storage:', err);
  }
  return null;
};

export const setSteamId = (id: string) => {
  _dynamicSteamId = id;
};

export const getSteamId = (): string => {
  return _dynamicSteamId;
};

export const getSteamApiKey = (): string => {
  if (_dynamicSteamApiKey) {
    return _dynamicSteamApiKey;
  } else {
    console.warn('STEAM API key is not set. Please update your profile or sign in.');
    return '';
  }
};
