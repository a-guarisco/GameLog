import { Platform } from 'react-native';

const mockConnectAuthEmulator = jest.fn();
const mockResolveServiceUrl = jest.fn();
const mockInitializeAuth = jest.fn(() => ({}));
const mockGetAuth = jest.fn(() => ({}));

jest.unmock('@gamelog/auth/firebaseClient');
jest.unmock('../../src/auth/firebaseClient');

jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('@firebase/auth', () => ({
  initializeAuth: mockInitializeAuth,
  getAuth: mockGetAuth,
  getReactNativePersistence: jest.fn(),
  connectAuthEmulator: mockConnectAuthEmulator,
}));

jest.mock('@gamelog/api-manager/serviceDiscovery', () => ({
  resolveServiceUrl: mockResolveServiceUrl,
}));

describe('firebaseClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('@firebase/auth', () => ({
      initializeAuth: mockInitializeAuth,
      getAuth: mockGetAuth,
      getReactNativePersistence: jest.fn(),
      connectAuthEmulator: mockConnectAuthEmulator,
    }));
    jest.doMock('@gamelog/api-manager/serviceDiscovery', () => ({
      resolveServiceUrl: mockResolveServiceUrl,
    }));
    mockConnectAuthEmulator.mockClear();
    mockResolveServiceUrl.mockClear();
    mockInitializeAuth.mockClear();
    mockGetAuth.mockClear();
    process.env = { ...originalEnv };

    // Reset global state
    const globalAny = global as any;
    globalAny.__isAuthEmulatorConnected = false;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const setupValidEnv = () => {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test-key';
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-domain';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'test-id';
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender';
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID = 'test-app';
    process.env.EXPO_PUBLIC_IS_DEV = 'true';
  };

  it('throws an error if required env var is missing', () => {
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    jest.isolateModules(() => {
      expect(() => {
        require('../../src/auth/firebaseClient');
      }).toThrow('Missing required env var: EXPO_PUBLIC_FIREBASE_API_KEY');
    });
  });

  it('initializes firebase app when env vars are present', async () => {
    setupValidEnv();
    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(mockInitializeAuth).toHaveBeenCalled();
    });
  });

  it('uses emulator by default on android', async () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    Platform.OS = 'android';
    mockResolveServiceUrl.mockResolvedValue('http://10.0.2.2:9099');

    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(mockConnectAuthEmulator).toHaveBeenCalledWith(expect.anything(), 'http://10.0.2.2:9099', { disableWarnings: true });
    });
  });

  it('uses localhost for ios emulator by default', async () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    delete process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
    Platform.OS = 'ios';
    mockResolveServiceUrl.mockResolvedValue('http://localhost:9099');

    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(mockConnectAuthEmulator).toHaveBeenCalledWith(expect.anything(), 'http://localhost:9099', { disableWarnings: true });
    });
  });

  it('skips emulator when EXPO_PUBLIC_USE_FIREBASE_EMULATOR is false', async () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'false';
    
    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(mockInitializeAuth).toHaveBeenCalled();
      expect(mockConnectAuthEmulator).not.toHaveBeenCalled();
    });
  });

  it('falls back to getAuth if initializeAuth throws', async () => {
    setupValidEnv();

    const errorInitializeAuth = jest.fn(() => {
      throw new Error('Cannot init twice');
    });

    jest.doMock('@firebase/auth', () => ({
      initializeAuth: errorInitializeAuth,
      getAuth: mockGetAuth,
      getReactNativePersistence: jest.fn(),
      connectAuthEmulator: jest.fn(),
    }));

    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(errorInitializeAuth).toHaveBeenCalled();
      expect(mockGetAuth).toHaveBeenCalled();
    });
  });

  it('uses existing app if getApps() is not empty', () => {
    setupValidEnv();
    const existingApp = { name: 'existing-app' };
    jest.doMock('firebase/app', () => ({
      getApps: jest.fn(() => [existingApp]),
      initializeApp: jest.fn(),
    }));
    jest.isolateModules(() => {
      const client = require('../../src/auth/firebaseClient');
      expect(client.app).toEqual(existingApp);
    });
  });

  it('does not call connectAuthEmulator twice if global is set', async () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    const globalAny = global as any;
    globalAny.__isAuthEmulatorConnected = true;

    await jest.isolateModules(async () => {
      const client = require('../../src/auth/firebaseClient');
      await client.setupAuthEmulator();
      expect(mockConnectAuthEmulator).not.toHaveBeenCalled();
    });
  });
});
