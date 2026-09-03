import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GoogleAuthTest } from '@gamelog/dev/GoogleAuthTest';
import { signInWithGoogle, signOutGoogle } from '@gamelog/auth/googleAuth';

jest.mock('@gamelog/auth/googleAuth', () => ({
  signInWithGoogle: jest.fn(),
  signOutGoogle: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: () => ({
    currentUser: null,
  }),
}));

describe('GoogleAuthTest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default state', () => {
    const { getByText } = render(<GoogleAuthTest />);
    expect(getByText('Sign In with Google (OAuth2)')).toBeTruthy();
    expect(getByText(/Configured Web Client ID:/)).toBeTruthy();
  });

  it('handles successful Google Sign-In', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce({
      uid: 'google-user-uid',
      email: 'google@test.com',
      displayName: 'Google Test User',
    });

    const { getByText } = render(<GoogleAuthTest />);
    const signInBtn = getByText('Sign In with Google (OAuth2)');

    fireEvent.press(signInBtn);

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(getByText(/Google Sign-In Successful!/)).toBeTruthy();
      expect(getByText('Sign Out Google Account')).toBeTruthy();
    });
  });

  it('handles Google Sign-In error', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValueOnce(new Error('Google sign in cancelled'));

    const { getByText } = render(<GoogleAuthTest />);
    const signInBtn = getByText('Sign In with Google (OAuth2)');

    fireEvent.press(signInBtn);

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(getByText('Google sign in cancelled')).toBeTruthy();
    });
  });

  it('handles successful Google Sign-Out', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce({
      uid: 'google-user-uid',
      email: 'google@test.com',
      displayName: 'Google Test User',
    });
    (signOutGoogle as jest.Mock).mockResolvedValueOnce(undefined);

    const { getByText } = render(<GoogleAuthTest />);
    fireEvent.press(getByText('Sign In with Google (OAuth2)'));

    await waitFor(() => {
      expect(getByText('Sign Out Google Account')).toBeTruthy();
    });

    fireEvent.press(getByText('Sign Out Google Account'));

    await waitFor(() => {
      expect(signOutGoogle).toHaveBeenCalledTimes(1);
      expect(getByText('Signed out from Google Sign-In session.')).toBeTruthy();
    });
  });
});
