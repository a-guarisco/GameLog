import { useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import apiManager from '@gamelog/api-manager/apiManager';
import { setSteamApiKey, setSteamId } from '@gamelog/api-manager/apiEndsPoints';
import { auth } from '@gamelog/auth/firebaseClient';

export function useProfileSetup() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [steamId, setSteamId] = useState('');
  const [steamApiKey, setSteamApiKey] = useState('');

  const handleRegister = async () => {
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long');
      return;
    }
    if (!steamId) {
      setErrorMsg('Steam ID is required');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await apiManager.registerUser({
        username,
        steam_id: steamId,
        steam_api_key: steamApiKey || undefined,
      });
      if (response.steam_api_key) {
        setSteamApiKey(response.steam_api_key);
      }
      setSteamId(steamId);
      DeviceEventEmitter.emit('registrationSuccess');
    } catch (err: unknown) {
      const errorWithResponse = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const msg =
        errorWithResponse.response?.data?.detail ||
        errorWithResponse.message ||
        'Failed to complete profile setup';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return {
    loading,
    errorMsg,
    username,
    setUsername,
    steamId,
    setSteamId,
    steamApiKey,
    setSteamApiKey,
    handleRegister,
    handleSignOut,
  };
}
