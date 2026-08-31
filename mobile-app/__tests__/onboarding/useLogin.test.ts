import { renderHook, act } from '@testing-library/react-native';
import { useLogin } from '../../src/onboarding/useLogin';
import { signInWithGoogle } from '@gamelog/auth/googleAuth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';

jest.mock('@gamelog/auth/googleAuth', () => ({
  signInWithGoogle: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  auth: {},
}));

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.loading).toBe(false);
    expect(result.current.errorCode).toBeNull();
    expect(result.current.successMsg).toBeNull();
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.authMode).toBe('signin');
    expect(result.current.isSignUp).toBe(false);
  });

  it('can toggle auth mode', () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.setIsSignUp(true);
    });
    expect(result.current.authMode).toBe('signup');
    expect(result.current.isSignUp).toBe(true);

    act(() => {
      result.current.setIsSignUp(false);
    });
    expect(result.current.authMode).toBe('signin');
    expect(result.current.isSignUp).toBe(false);
  });

  it('can update form fields', () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      result.current.setConfirmPassword('password123');
    });
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('password123');
    expect(result.current.confirmPassword).toBe('password123');
  });

  describe('handleGoogleSignIn', () => {
    it('calls signInWithGoogle successfully', async () => {
      const { result } = renderHook(() => useLogin());
      (signInWithGoogle as jest.Mock).mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(signInWithGoogle).toHaveBeenCalled();
      expect(result.current.errorCode).toBeNull();
    });

    it('sets error code if signInWithGoogle fails', async () => {
      const { result } = renderHook(() => useLogin());
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce({ code: 'auth/google-error' });

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(result.current.errorCode).toBe('auth/google-error');
      expect(result.current.loading).toBe(false);
    });

    it('sets default error code if signInWithGoogle fails without code', async () => {
      const { result } = renderHook(() => useLogin());
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce({});

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(result.current.errorCode).toBe('auth/google-sign-in-failed');
    });
  });

  describe('handleFacebookSignIn', () => {
    it('sets provider-setup-pending error', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleFacebookSignIn();
      });

      expect(result.current.errorCode).toBe('auth/provider-setup-pending');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleGithubSignIn', () => {
    it('sets provider-setup-pending error', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleGithubSignIn();
      });

      expect(result.current.errorCode).toBe('auth/provider-setup-pending');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleEmailAuth', () => {
    it('sets validation error if missing fields', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(result.current.errorCode).toBe('validation/missing-fields');
    });

    it('sets validation error if passwords mismatch in signup', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setIsSignUp(true);
        result.current.setEmail('test@example.com');
        result.current.setPassword('pass1');
        result.current.setConfirmPassword('pass2');
      });

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(result.current.errorCode).toBe('validation/password-mismatch');
    });

    it('calls signInWithEmailAndPassword in signin mode', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('password123');
      });

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.errorCode).toBeNull();
    });

    it('calls createUserWithEmailAndPassword in signup mode', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setIsSignUp(true);
        result.current.setEmail('test@example.com');
        result.current.setPassword('password123');
        result.current.setConfirmPassword('password123');
      });

      const mockUser = { uid: '123' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: mockUser });
      (sendEmailVerification as jest.Mock).mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.errorCode).toBeNull();
    });

    it('handles firebase auth errors with code', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('password123');
      });

      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: 'auth/invalid-credential',
      });

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(result.current.errorCode).toBe('auth/invalid-credential');
      expect(result.current.loading).toBe(false);
    });

    it('extracts firebase error code from message if code is missing', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('password123');
      });

      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        message: 'Firebase: Error (auth/user-not-found).',
      });

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(result.current.errorCode).toBe('auth/user-not-found');
    });

    it('falls back to network-request-failed if no code or message matches', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('password123');
      });

      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Unknown error'));

      await act(async () => {
        await result.current.handleEmailAuth();
      });

      expect(result.current.errorCode).toBe('auth/network-request-failed');
    });
  });
});
