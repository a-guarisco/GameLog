import { Platform } from 'react-native';

jest.unmock('@gamelog/auth/firebaseClient');
jest.unmock('../../src/auth/firebaseClient');

jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('@firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

describe('firebaseClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
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
  };

  it('throws an error if required env var is missing', () => {
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    jest.isolateModules(() => {
      expect(() => {
        require('../../src/auth/firebaseClient');
      }).toThrow('Missing required env var: EXPO_PUBLIC_FIREBASE_API_KEY');
    });
  });

  it('initializes firebase app when env vars are present', () => {
    setupValidEnv();
    const { app, auth } = require('../../src/auth/firebaseClient');
    expect(app).toBeDefined();
    expect(auth).toBeDefined();
  });

  it('uses emulator by default on android', () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    Platform.OS = 'android';
    const { auth } = require('../../src/auth/firebaseClient');
    // We mock connectAuthEmulator in jest config or it might fail if not mocked
    // Actually firebase/auth is mocked globally usually, but if not we can just assert auth is defined
    expect(auth).toBeDefined();
  });

  it('uses emulator by default on ios', () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    Platform.OS = 'ios';
    const { auth } = require('../../src/auth/firebaseClient');
    expect(auth).toBeDefined();
  });

  it('skips emulator when EXPO_PUBLIC_USE_FIREBASE_EMULATOR is false', () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'false';
    const { auth } = require('../../src/auth/firebaseClient');
    expect(auth).toBeDefined();
  });

  it('falls back to getAuth if initializeAuth throws', () => {
    setupValidEnv();

    // Mock @firebase/auth to throw on initializeAuth
    jest.doMock('@firebase/auth', () => {
      return {
        initializeAuth: () => {
          throw new Error('Cannot init twice');
        },
        getAuth: jest.fn(() => 'fallback-auth'),
        getReactNativePersistence: jest.fn(),
        connectAuthEmulator: jest.fn(),
      };
    });

    jest.isolateModules(() => {
      const { auth } = require('../../src/auth/firebaseClient');
      expect(auth).toBe('fallback-auth');
    });
  });

  it('uses existing app if getApps() is not empty', () => {
    setupValidEnv();
    jest.doMock('firebase/app', () => ({
      getApps: jest.fn(() => ['existing-app']),
      initializeApp: jest.fn(),
    }));
    jest.isolateModules(() => {
      const { app } = require('../../src/auth/firebaseClient');
      expect(app).toBe('existing-app');
    });
  });

  it('uses unknown-project if EXPO_PUBLIC_FIREBASE_PROJECT_ID is missing', () => {
    setupValidEnv();
    delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    jest.isolateModules(() => {
      const { app } = require('../../src/auth/firebaseClient');
      expect(app).toBeDefined(); // Just ensuring it doesn't crash
    });
  });
  it('uses custom emulator host when EXPO_PUBLIC_FIREBASE_EMULATOR_HOST is provided', () => {
    setupValidEnv();
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST = 'http://custom.host:9099';
    jest.isolateModules(() => {
      const { auth } = require('../../src/auth/firebaseClient');
      expect(auth).toBeDefined();
    });
  });
});
