import { configureGoogleAuth, signInWithGoogle, signOutGoogle } from '../../src/auth/googleAuth';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { signInWithCredential } from 'firebase/auth';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    executionEnvironment: 'standalone', // Not StoreClient by default
  },
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
  },
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(() => 'mock-credential'),
  },
  signInWithCredential: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  auth: {},
}));

const mockGoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: mockGoogleSignin,
}));

describe('googleAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Constants.executionEnvironment = 'standalone' as any;
  });

  describe('configureGoogleAuth', () => {
    it('configures GoogleSignin when not in Expo Go', () => {
      jest.isolateModules(() => {
        const { configureGoogleAuth } = require('../../src/auth/googleAuth');
        configureGoogleAuth();
        expect(mockGoogleSignin.configure).toHaveBeenCalled();
      });
    });

    it('does nothing in Expo Go', () => {
      Constants.executionEnvironment = ExecutionEnvironment.StoreClient;
      jest.isolateModules(() => {
        const { configureGoogleAuth } = require('../../src/auth/googleAuth');
        configureGoogleAuth();
        expect(mockGoogleSignin.configure).not.toHaveBeenCalled();
      });
    });
  });

  describe('with isolated modules', () => {
    let googleAuth: any;
    
    beforeEach(() => {
      jest.resetModules();
    });

    it('throws error on signIn if in Expo Go', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'storeClient' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      googleAuth = require('../../src/auth/googleAuth');

      await expect(googleAuth.signInWithGoogle()).rejects.toThrow('Native Google Sign-In is not supported in Expo Go');
    });

    it('throws error if GoogleSignin throws on require', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'standalone' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      jest.doMock('@react-native-google-signin/google-signin', () => {
        throw new Error('Module not found');
      });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      googleAuth = require('../../src/auth/googleAuth');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Google Auth] Native GoogleSignin module not found:', expect.any(Error));
      await expect(googleAuth.signInWithGoogle()).rejects.toThrow('Native Google Sign-In is not supported in Expo Go');
      
      consoleWarnSpy.mockRestore();
    });

    it('handles successful signIn', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'standalone' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      
      const gMock = {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn().mockResolvedValue({ data: { idToken: 'test-token' } }),
      };
      
      jest.doMock('@react-native-google-signin/google-signin', () => ({
        GoogleSignin: gMock,
      }));
      
      const fMock = {
        GoogleAuthProvider: { credential: jest.fn(() => 'cred') },
        signInWithCredential: jest.fn().mockResolvedValue({ user: { uid: 'user-1' } }),
      };
      jest.doMock('firebase/auth', () => fMock);
      
      googleAuth = require('../../src/auth/googleAuth');
      
      const user = await googleAuth.signInWithGoogle();
      expect(gMock.configure).toHaveBeenCalled();
      expect(gMock.hasPlayServices).toHaveBeenCalled();
      expect(gMock.signIn).toHaveBeenCalled();
      expect(fMock.signInWithCredential).toHaveBeenCalled();
      expect(user).toEqual({ uid: 'user-1' });
    });

    it('throws if no idToken is returned', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'standalone' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      
      const gMock = {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn().mockResolvedValue({ data: {} }), // Missing idToken
      };
      jest.doMock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: gMock }));
      jest.doMock('firebase/auth', () => ({}));
      
      googleAuth = require('../../src/auth/googleAuth');
      
      await expect(googleAuth.signInWithGoogle()).rejects.toThrow('Google Sign-In completed, but no ID Token was returned.');
    });

    it('does nothing on signOut if in Expo Go', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'storeClient' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      const gMock = { signOut: jest.fn() };
      jest.doMock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: gMock }));
      
      googleAuth = require('../../src/auth/googleAuth');
      
      await googleAuth.signOutGoogle();
      expect(gMock.signOut).not.toHaveBeenCalled();
    });

    it('calls signOut on GoogleSignin if not in Expo Go', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'standalone' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      const gMock = { configure: jest.fn(), signOut: jest.fn() };
      jest.doMock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: gMock }));
      
      googleAuth = require('../../src/auth/googleAuth');
      
      await googleAuth.signOutGoogle();
      expect(gMock.signOut).toHaveBeenCalled();
    });

    it('catches and warns on signOut error', async () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: 'standalone' },
        ExecutionEnvironment: { StoreClient: 'storeClient' },
      }));
      const gMock = { configure: jest.fn(), signOut: jest.fn().mockRejectedValue(new Error('Signout error')) };
      jest.doMock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: gMock }));
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      googleAuth = require('../../src/auth/googleAuth');
      await googleAuth.signOutGoogle();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Google Auth] Sign-out warning:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });
  });
});
