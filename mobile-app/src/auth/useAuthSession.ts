import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import apiManager from '@gamelog/api-manager/apiManager';
import {
  setSteamApiKey,
  setSteamId,
  clearSteamApiKey,
  initSteamApiKeyFromStorage,
} from '@gamelog/api-manager/steamApiKey';
import type { UserMeRead } from '@gamelog/api-manager/dto';

export type AuthState =
  | 'loading'
  | 'unauthenticated'
  | 'unverified'
  | 'onboarding'
  | 'authenticated';

export const useAuthSession = () => {
  const [authState, setAuthStateInternal] = useState<AuthState>('loading');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<UserMeRead | null>(null);

  const setAuthState = (state: AuthState) => {
    console.log(`[Auth Session] State changed to: ${state}`);
    setAuthStateInternal(state);
  };

  const checkBackendRegistration = async (user: User) => {
    console.log('[Auth Session] Checking backend registration...');
    try {
      // Fetch current user from backend
      console.log('[Auth Session] Calling apiManager.getUserMe()...');
      const response = await apiManager.getUserMe();
      console.log('[Auth Session] apiManager.getUserMe() succeeded.');
      setBackendUser(response);
      if (response.steam_api_key) {
        console.log('[Auth Session] Steam API key found.');
        setSteamApiKey(response.steam_api_key);
      } else {
        console.log('[Auth Session] No Steam API key found.');
        await initSteamApiKeyFromStorage();
      }
      if (response.steam_id) {
        setSteamId(response.steam_id);
      }
      setAuthState('authenticated');
    } catch (error: any) {
      console.log('[Auth Session] apiManager.getUserMe() failed:', error?.message);
      if (
        error?.response?.status === 404 ||
        (error instanceof Error && error.message.includes('404'))
      ) {
        // User is not registered in the backend
        setBackendUser(null);
        setAuthState('onboarding');
      } else {
        // Network error or backend unreachable
        console.error('Error fetching /users/me', error);
        setBackendUser(null);
        setAuthState('unauthenticated');
        try {
          await getFirebaseAuth().signOut();
        } catch {
          // ignore signout errors
        }
        DeviceEventEmitter.emit('backendConnectionError', {
          message: 'Unable to connect to GameLog server. The backend may be offline.',
        });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user);
      if (user) {
        if (!user.emailVerified && user.providerData.some((p) => p.providerId === 'password')) {
          setAuthState('unverified');
          return;
        }
        // We have a Firebase user, check if they exist in PostgreSQL
        await checkBackendRegistration(user);
      } else {
        setBackendUser(null);
        clearSteamApiKey().catch(() => {});
        setAuthState('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshBackendUser = async () => {
    if (firebaseUser) {
      setAuthState('loading');
      await checkBackendRegistration(firebaseUser);
    }
  };

  const checkEmailVerification = async () => {
    if (firebaseUser) {
      setAuthState('loading');
      await firebaseUser.reload();
      const updatedUser = getFirebaseAuth().currentUser;
      setFirebaseUser(updatedUser);

      // FORZA l'aggiornamento del token Firebase.
      // Questo invierà l'evento `onIdTokenChanged` a tutte le istanze del nostro hook in tutta l'app!
      await updatedUser?.getIdToken(true);

      if (
        updatedUser?.emailVerified ||
        !updatedUser?.providerData.some((p) => p.providerId === 'password')
      ) {
        await checkBackendRegistration(updatedUser!);
      } else {
        setAuthState('unverified');
      }
    }
  };

  return {
    authState,
    firebaseUser,
    backendUser,
    refreshBackendUser,
    checkEmailVerification,
  };
};
