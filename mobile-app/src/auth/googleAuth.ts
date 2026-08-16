import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { auth } from './firebaseClient';

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '799231800910-coul5brdbsfglpgj41n2nsufedt1ju5p.apps.googleusercontent.com';

export const configureGoogleAuth = (): void => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    offlineAccess: false,
  });
};

export const signInWithGoogle = async (): Promise<User> => {
  configureGoogleAuth();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;

  if (!idToken) {
    throw new Error('Google Sign-In completed, but no ID Token was returned.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);

  return userCredential.user;
};

export const signOutGoogle = async (): Promise<void> => {
  try {
    configureGoogleAuth();
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('[Google Auth] Sign-out warning:', error);
  }
};
