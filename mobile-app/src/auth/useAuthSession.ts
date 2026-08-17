import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';
import apiManager from '@gamelog/api-manager/apiManager';
import type { UserRead } from '@gamelog/api-manager/dto';

export type AuthState = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated';

export const useAuthSession = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<UserRead | null>(null);

  const checkBackendRegistration = async (user: User) => {
    try {
      // Fetch current user from backend
      const response = await apiManager.getUserMe();
      setBackendUser(response);
      setAuthState('authenticated');
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('404')) {
        // User is not registered in the backend
        setBackendUser(null);
        setAuthState('onboarding');
      } else {
        // Network error or other issues
        console.error('Error fetching /users/me', error);
        setAuthState('unauthenticated');
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // We have a Firebase user, check if they exist in PostgreSQL
        await checkBackendRegistration(user);
      } else {
        setBackendUser(null);
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

  return {
    authState,
    firebaseUser,
    backendUser,
    refreshBackendUser,
  };
};
