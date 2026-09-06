export const getAuthErrorMessage = (errorCode: string | null | undefined): string => {
  if (!errorCode) return '';

  const errorMap: Record<string, string> = {
    // Auth Login/Signup Errors (Firebase Backend)
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'Account not found.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email format.',
    'auth/weak-password': 'Password is too weak (min. 6 characters).',
    'auth/unverified-email': 'Please verify your email before signing in.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/backend-unreachable': 'Unable to connect to GameLog server. The backend may be offline.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',

    // External Providers (Google, Facebook, Github)
    'auth/google-sign-in-failed': 'Google sign-in failed or was cancelled.',
    'auth/facebook-sign-in-failed': 'Facebook sign-in failed or was cancelled.',
    'auth/github-sign-in-failed': 'GitHub sign-in failed or was cancelled.',
    'auth/provider-setup-pending': 'Sign-in provider setup is pending.',

    // Custom Validation Errors (Frontend)
    'validation/missing-fields': 'Email and password are required.',
    'validation/password-mismatch': 'Passwords do not match.',
  };

  return errorMap[errorCode] || 'Authentication failed. Please try again later.';
};
