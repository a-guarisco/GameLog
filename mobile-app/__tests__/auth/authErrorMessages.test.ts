import { getAuthErrorMessage } from '../../src/auth/authErrorMessages';

describe('authErrorMessages', () => {
  it('returns empty string for null or undefined', () => {
    expect(getAuthErrorMessage(null)).toBe('');
    expect(getAuthErrorMessage(undefined)).toBe('');
  });

  it('returns mapped error messages', () => {
    expect(getAuthErrorMessage('auth/invalid-credential')).toBe('Invalid email or password.');
    expect(getAuthErrorMessage('auth/user-not-found')).toBe('Account not found.');
    expect(getAuthErrorMessage('auth/wrong-password')).toBe('Incorrect password.');
    expect(getAuthErrorMessage('auth/email-already-in-use')).toBe(
      'This email is already registered.'
    );
    expect(getAuthErrorMessage('auth/invalid-email')).toBe('Invalid email format.');
    expect(getAuthErrorMessage('auth/weak-password')).toBe(
      'Password is too weak (min. 6 characters).'
    );
    expect(getAuthErrorMessage('auth/unverified-email')).toBe(
      'Please verify your email before signing in.'
    );
    expect(getAuthErrorMessage('auth/too-many-requests')).toBe(
      'Too many attempts. Please try again later.'
    );
    expect(getAuthErrorMessage('auth/network-request-failed')).toBe(
      'Network error. Please check your connection.'
    );
    expect(getAuthErrorMessage('auth/operation-not-allowed')).toBe(
      'This sign-in method is not enabled.'
    );
    expect(getAuthErrorMessage('auth/google-sign-in-failed')).toBe(
      'Google sign-in failed or was cancelled.'
    );
    expect(getAuthErrorMessage('auth/facebook-sign-in-failed')).toBe(
      'Facebook sign-in failed or was cancelled.'
    );
    expect(getAuthErrorMessage('auth/github-sign-in-failed')).toBe(
      'GitHub sign-in failed or was cancelled.'
    );
    expect(getAuthErrorMessage('auth/provider-setup-pending')).toBe(
      'Sign-in provider setup is pending.'
    );
    expect(getAuthErrorMessage('validation/missing-fields')).toBe(
      'Email and password are required.'
    );
    expect(getAuthErrorMessage('validation/password-mismatch')).toBe('Passwords do not match.');
  });

  it('returns fallback message for unknown error code', () => {
    expect(getAuthErrorMessage('unknown-error')).toBe(
      'Authentication failed. Please try again later.'
    );
  });
});
