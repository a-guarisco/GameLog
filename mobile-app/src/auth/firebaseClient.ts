import { Platform } from 'react-native';
import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
// @ts-expect-error getReactNativePersistence exists in React Native build of firebase/auth
import {
  initializeAuth,
  getAuth,
  connectAuthEmulator,
  getReactNativePersistence,
} from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { resolveServiceUrl } from '@gamelog/api-manager/serviceDiscovery';

const getRequiredEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, 'EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv(
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  ),
  projectId: getRequiredEnv(
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
  ),
  storageBucket: getRequiredEnv(
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  ),
  messagingSenderId: getRequiredEnv(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  ),
  appId: getRequiredEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, 'EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const useEmulator = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR !== 'false';
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

let auth: ReturnType<typeof getAuth>;

const initializeFirebaseAuth = () => {
  if (auth) return auth;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
  return auth;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    // During Metro Fast Refresh, the module is re-evaluated and `auth` becomes undefined.
    // Since App state is preserved, setupAuthEmulator() won't be called again.
    // We lazily re-initialize it here to survive hot reloads.
    initializeFirebaseAuth();
  }
  return auth;
};

const globalAny = global as any;

export const setupAuthEmulator = async () => {
  if (!useEmulator || globalAny.__isAuthEmulatorConnected) {
    initializeFirebaseAuth();
    return;
  }

  try {
    const isDev = process.env.EXPO_PUBLIC_IS_DEV === 'true';
    const authEmulatorHost = await resolveServiceUrl(
      process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST,
      'FirebaseAuth',
      9099,
      '/',
      isDev
    );

    if (globalAny.__isAuthEmulatorConnected) return;

    // Initialize Auth IMMEDIATELY before connecting the emulator
    // to absolutely guarantee no network requests are fired beforehand.
    initializeFirebaseAuth();

    connectAuthEmulator(auth, authEmulatorHost, { disableWarnings: true });
    globalAny.__isAuthEmulatorConnected = true;
    console.log(
      `[Firebase Auth] 🛠️ Mode: EMULATOR | Project: ${projectId} | Host: ${authEmulatorHost}`
    );
  } catch (error) {
    console.warn('[Firebase Auth] Failed to connect emulator:', error);
    initializeFirebaseAuth(); // Ensure auth is initialized even on failure
  }
};

if (!useEmulator) {
  console.log(`[Firebase Auth] ☁️ Mode: LIVE (Cloud) | Project: ${projectId}`);
}

export { app };
