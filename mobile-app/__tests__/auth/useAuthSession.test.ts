import { renderHook, act } from '@testing-library/react-native';
import { useAuthSession } from '../../src/auth/useAuthSession';
import { onIdTokenChanged } from 'firebase/auth';
import apiManager from '@gamelog/api-manager/apiManager';
import {
  setSteamId,
  setSteamApiKey,
  clearSteamApiKey,
  initSteamApiKeyFromStorage,
} from '@gamelog/api-manager/steamApiKey';

jest.mock('firebase/auth', () => ({
  onIdTokenChanged: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: () => mockAuth,
}));

// We'll define a mutable mockAuth object that we can manipulate in tests.
const mockAuth: any = { currentUser: null };

jest.mock('@gamelog/api-manager/apiManager', () => ({
  getUserMe: jest.fn(),
}));

jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  setSteamId: jest.fn(),
  setSteamApiKey: jest.fn(),
  clearSteamApiKey: jest.fn(() => Promise.resolve()),
  initSteamApiKeyFromStorage: jest.fn(() => Promise.resolve(null)),
}));

describe('useAuthSession', () => {
  let mockOnIdTokenChangedCallback: (user: any) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    (onIdTokenChanged as jest.Mock).mockImplementation((_auth, callback) => {
      mockOnIdTokenChangedCallback = callback;
      return jest.fn(); // unsubscribe fn
    });
  });

  const getUnverifiedFirebaseUser = () => ({
    emailVerified: false,
    providerData: [{ providerId: 'password' }],
    reload: jest.fn().mockResolvedValue(undefined),
    getIdToken: jest.fn().mockResolvedValue('token'),
  });

  const getVerifiedFirebaseUser = () => ({
    emailVerified: true,
    providerData: [{ providerId: 'password' }],
    reload: jest.fn().mockResolvedValue(undefined),
    getIdToken: jest.fn().mockResolvedValue('token'),
  });

  const getSocialFirebaseUser = () => ({
    emailVerified: false,
    providerData: [{ providerId: 'google.com' }],
    reload: jest.fn().mockResolvedValue(undefined),
    getIdToken: jest.fn().mockResolvedValue('token'),
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.authState).toBe('loading');
    expect(result.current.firebaseUser).toBeNull();
    expect(result.current.backendUser).toBeNull();
  });

  it('sets unauthenticated and clears steam api key when firebase user is null', async () => {
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(null);
    });

    expect(result.current.authState).toBe('unauthenticated');
    expect(result.current.firebaseUser).toBeNull();
    expect(clearSteamApiKey).toHaveBeenCalled();
  });

  it('sets unverified for password user without email verified', async () => {
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getUnverifiedFirebaseUser());
    });

    expect(result.current.authState).toBe('unverified');
    expect(result.current.firebaseUser).not.toBeNull();
  });

  it('sets authenticated and stores steam credentials if backend returns user', async () => {
    (apiManager.getUserMe as jest.Mock).mockResolvedValue({
      id: '123',
      steam_id: 'steam123',
      steam_api_key: 'key123',
    });
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getVerifiedFirebaseUser());
    });

    expect(result.current.authState).toBe('authenticated');
    expect(result.current.backendUser).toEqual({
      id: '123',
      steam_id: 'steam123',
      steam_api_key: 'key123',
    });
    expect(setSteamId).toHaveBeenCalledWith('steam123');
    expect(setSteamApiKey).toHaveBeenCalledWith('key123');
  });

  it('attempts to restore steam api key from secure storage if backend user does not have steam_api_key', async () => {
    (apiManager.getUserMe as jest.Mock).mockResolvedValue({ id: '123', steam_id: 'steam123' });
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getVerifiedFirebaseUser());
    });

    expect(result.current.authState).toBe('authenticated');
    expect(initSteamApiKeyFromStorage).toHaveBeenCalled();
  });

  it('sets onboarding if backend returns 404 with error response', async () => {
    (apiManager.getUserMe as jest.Mock).mockRejectedValue({ response: { status: 404 } });
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getVerifiedFirebaseUser());
    });

    expect(result.current.authState).toBe('onboarding');
  });

  it('sets onboarding if backend returns Error with 404 in message', async () => {
    (apiManager.getUserMe as jest.Mock).mockRejectedValue(
      new Error('Request failed with status 404')
    );
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getSocialFirebaseUser()); // social user bypasses email verified
    });

    expect(result.current.authState).toBe('onboarding');
  });

  it('sets unauthenticated on generic backend error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (apiManager.getUserMe as jest.Mock).mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await mockOnIdTokenChangedCallback(getVerifiedFirebaseUser());
    });

    expect(result.current.authState).toBe('unauthenticated');
    consoleErrorSpy.mockRestore();
  });

  describe('refreshBackendUser', () => {
    it('does nothing if no firebaseUser', async () => {
      const { result } = renderHook(() => useAuthSession());
      await act(async () => {
        await result.current.refreshBackendUser();
      });
      expect(apiManager.getUserMe).not.toHaveBeenCalled();
    });

    it('refreshes backend user if firebaseUser exists', async () => {
      (apiManager.getUserMe as jest.Mock).mockResolvedValue({ id: '456' });
      const { result } = renderHook(() => useAuthSession());

      await act(async () => {
        await mockOnIdTokenChangedCallback(getVerifiedFirebaseUser());
      });

      expect(result.current.backendUser).toEqual({ id: '456' });

      (apiManager.getUserMe as jest.Mock).mockResolvedValue({ id: '789' });
      await act(async () => {
        await result.current.refreshBackendUser();
      });

      expect(result.current.backendUser).toEqual({ id: '789' });
      expect(result.current.authState).toBe('authenticated');
    });
  });

  describe('checkEmailVerification', () => {
    it('does nothing if no firebaseUser', async () => {
      const { result } = renderHook(() => useAuthSession());
      await act(async () => {
        await result.current.checkEmailVerification();
      });
      // nothing happens
    });

    it('reloads user and proceeds to checkBackendRegistration if verified', async () => {
      (apiManager.getUserMe as jest.Mock).mockResolvedValue({ id: '111' });

      const unverifiedUser = getUnverifiedFirebaseUser();
      const verifiedUser = getVerifiedFirebaseUser();

      // auth.currentUser will return verifiedUser after reload
      mockAuth.currentUser = verifiedUser;

      const { result } = renderHook(() => useAuthSession());

      await act(async () => {
        await mockOnIdTokenChangedCallback(unverifiedUser);
      });
      expect(result.current.authState).toBe('unverified');

      await act(async () => {
        await result.current.checkEmailVerification();
      });

      expect(unverifiedUser.reload).toHaveBeenCalled();
      expect(verifiedUser.getIdToken).toHaveBeenCalledWith(true);
      expect(result.current.authState).toBe('authenticated');
      expect(result.current.backendUser).toEqual({ id: '111' });
    });

    it('stays unverified if user is still not verified', async () => {
      const unverifiedUser = getUnverifiedFirebaseUser();
      mockAuth.currentUser = unverifiedUser; // still unverified after reload

      const { result } = renderHook(() => useAuthSession());

      await act(async () => {
        await mockOnIdTokenChangedCallback(unverifiedUser);
      });
      expect(result.current.authState).toBe('unverified');

      await act(async () => {
        await result.current.checkEmailVerification();
      });

      expect(result.current.authState).toBe('unverified');
    });
  });
});
