import { renderHook, act } from '@testing-library/react-native';
import { useProfileSetup } from '../../src/onboarding/useProfileSetup';
import { DeviceEventEmitter } from 'react-native';
import apiManager from '@gamelog/api-manager/apiManager';
import { setSteamId, setSteamApiKey } from '@gamelog/api-manager/steamApiKey';

import { requestAndRegisterPushToken } from '../../src/notifications/pushNotificationService';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  registerUser: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: () => mockAuth,
}));

const mockAuth: any = {
  signOut: jest.fn(),
};

jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  setSteamId: jest.fn(),
  setSteamApiKey: jest.fn(),
}));

jest.mock('../../src/notifications/pushNotificationService', () => ({
  requestAndRegisterPushToken: jest.fn(() => Promise.resolve({ success: true, token: 'fcm-123' })),
}));

describe('useProfileSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useProfileSetup());
    expect(result.current.loading).toBe(false);
    expect(result.current.errorMsg).toBeNull();
    expect(result.current.username).toBe('');
    expect(result.current.steamId).toBe('');
    expect(result.current.steamApiKey).toBe('');
  });

  it('validates username length', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('ab');
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.errorMsg).toBe('Username must be at least 3 characters long');
    expect(apiManager.registerUser).not.toHaveBeenCalled();
  });

  it('validates missing steamId', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('');
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.errorMsg).toBe('Steam ID is required');
    expect(apiManager.registerUser).not.toHaveBeenCalled();
  });

  it('calls apiManager.registerUser and emits event on success', async () => {
    const { result } = renderHook(() => useProfileSetup());
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('123456');
      result.current.setSteamApiKey('APIKEY123');
    });

    (apiManager.registerUser as jest.Mock).mockResolvedValueOnce({
      id: 'registered-user-id',
      steam_api_key: 'APIKEY123',
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(apiManager.registerUser).toHaveBeenCalledWith({
      username: 'validUser',
      steam_id: '123456',
      steam_api_key: 'APIKEY123',
    });
    expect(setSteamId).toHaveBeenCalledWith('123456');
    expect(setSteamApiKey).toHaveBeenCalledWith('APIKEY123');
    expect(requestAndRegisterPushToken).toHaveBeenCalledWith('registered-user-id');
    expect(emitSpy).toHaveBeenCalledWith('registrationSuccess');
    expect(result.current.loading).toBe(true); // Should remain true or we might not care since unmount happens
  });

  it('calls apiManager.registerUser without API key if not provided', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('123456');
    });

    (apiManager.registerUser as jest.Mock).mockResolvedValueOnce({});

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(apiManager.registerUser).toHaveBeenCalledWith({
      username: 'validUser',
      steam_id: '123456',
      steam_api_key: undefined,
    });
    expect(setSteamId).toHaveBeenCalledWith('123456');
    expect(setSteamApiKey).not.toHaveBeenCalled();
  });

  it('handles apiManager error with response detail', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('123456');
    });

    (apiManager.registerUser as jest.Mock).mockRejectedValueOnce({
      response: { data: { detail: 'Username already taken' } },
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.errorMsg).toBe('Username already taken');
    expect(result.current.loading).toBe(false);
  });

  it('handles apiManager error with message fallback', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('123456');
    });

    (apiManager.registerUser as jest.Mock).mockRejectedValueOnce({
      message: 'Network error',
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.errorMsg).toBe('Network error');
  });

  it('handles generic error with default fallback', async () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.setUsername('validUser');
      result.current.setSteamId('123456');
    });

    (apiManager.registerUser as jest.Mock).mockRejectedValueOnce({});

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.errorMsg).toBe('Failed to complete profile setup');
  });

  it('calls mockAuth.signOut on handleSignOut', () => {
    const { result } = renderHook(() => useProfileSetup());

    act(() => {
      result.current.handleSignOut();
    });

    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
