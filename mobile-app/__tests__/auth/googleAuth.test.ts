import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential } from 'firebase/auth';
import { signInWithGoogle, signOutGoogle, configureGoogleAuth } from '@gamelog/auth/googleAuth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  GoogleAuthProvider: {
    credential: jest.fn(() => ({ providerId: 'google.com' })),
  },
  signInWithCredential: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'google-test-uid',
        email: 'test@google.com',
      },
    })
  ),
}));

describe('googleAuth module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures GoogleSignin correctly', () => {
    configureGoogleAuth();
    expect(GoogleSignin.configure).toHaveBeenCalledWith(
      expect.objectContaining({
        webClientId: expect.any(String),
        offlineAccess: false,
      })
    );
  });


  it('executes signInWithGoogle flow', async () => {
    const user = await signInWithGoogle();
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(signInWithCredential).toHaveBeenCalled();
    expect(user.email).toBe('test@google.com');
  });

  it('throws error when no idToken returned', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValueOnce({ data: null });
    await expect(signInWithGoogle()).rejects.toThrow(
      'Google Sign-In completed, but no ID Token was returned.'
    );
  });

  it('executes signOutGoogle flow', async () => {
    await signOutGoogle();
    expect(GoogleSignin.signOut).toHaveBeenCalled();
  });
});
