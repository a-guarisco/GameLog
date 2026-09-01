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

const getDefaultAuthEmulatorHost = (): string =>
  Platform.OS === 'android' ? 'http://10.0.2.2:9099' : 'http://localhost:9099';

const getAuthEmulatorHost = (): string => {
  const configured = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST?.trim();

  if (!configured) {
    return getDefaultAuthEmulatorHost();
  }

  if (Platform.OS === 'android' && configured.includes('localhost')) {
    return 'http://10.0.2.2:9099';
  }

  if (Platform.OS === 'ios' && configured.includes('10.0.2.2')) {
    return 'http://localhost:9099';
  }

  return configured;
};

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  if (useEmulator) {
    const authEmulatorHost = getAuthEmulatorHost();

    connectAuthEmulator(auth, authEmulatorHost);
    console.log(
      `[Firebase Auth] 🛠️ Mode: EMULATOR | Project: ${projectId} | Host: ${authEmulatorHost}`
    );
  } else {
    console.log(`[Firebase Auth] ☁️ Mode: LIVE (Cloud) | Project: ${projectId}`);
  }
} catch {
  auth = getAuth(app);
}

export { app, auth };
