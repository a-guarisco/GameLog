import { renderHook, act } from '@testing-library/react-native';
import { useUnverifiedScreen } from '../../src/onboarding/useUnverifiedScreen';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';
import { useAuthSession } from '@gamelog/auth/useAuthSession';

jest.mock('firebase/auth', () => ({
  sendEmailVerification: jest.fn(),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  auth: {
    signOut: jest.fn(),
    currentUser: null,
  },
}));

jest.mock('@gamelog/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

describe('useUnverifiedScreen', () => {
  let mockCheckEmailVerification: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckEmailVerification = jest.fn();
    (useAuthSession as jest.Mock).mockReturnValue({
      firebaseUser: { uid: '123', email: 'test@example.com' },
      checkEmailVerification: mockCheckEmailVerification,
    });
    auth.currentUser = null;
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useUnverifiedScreen());
    expect(result.current.loading).toBe(false);
    expect(result.current.resendLoading).toBe(false);
    expect(result.current.errorCode).toBeNull();
    expect(result.current.successMsg).toBeNull();
    expect(result.current.firebaseUser).toEqual({ uid: '123', email: 'test@example.com' });
  });

  describe('handleCheckVerification', () => {
    it('sets unverified error if currentUser is still unverified', async () => {
      auth.currentUser = { emailVerified: false } as any;
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleCheckVerification();
      });

      expect(mockCheckEmailVerification).toHaveBeenCalled();
      expect(result.current.errorCode).toBe('auth/unverified-email');
      expect(result.current.loading).toBe(false);
    });

    it('does not set error if currentUser is verified', async () => {
      auth.currentUser = { emailVerified: true } as any;
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleCheckVerification();
      });

      expect(mockCheckEmailVerification).toHaveBeenCalled();
      expect(result.current.errorCode).toBeNull();
    });

    it('handles checkEmailVerification errors with code', async () => {
      mockCheckEmailVerification.mockRejectedValueOnce({ code: 'auth/network-error' });
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleCheckVerification();
      });

      expect(result.current.errorCode).toBe('auth/network-error');
      expect(result.current.loading).toBe(false);
    });

    it('extracts checkEmailVerification errors from message', async () => {
      mockCheckEmailVerification.mockRejectedValueOnce({ message: 'Error (auth/internal-error)' });
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleCheckVerification();
      });

      expect(result.current.errorCode).toBe('auth/internal-error');
    });

    it('falls back to network-request-failed on unknown error', async () => {
      mockCheckEmailVerification.mockRejectedValueOnce(new Error('Unknown'));
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleCheckVerification();
      });

      expect(result.current.errorCode).toBe('auth/network-request-failed');
    });
  });

  describe('handleResendEmail', () => {
    it('does nothing if no firebaseUser', async () => {
      (useAuthSession as jest.Mock).mockReturnValue({
        firebaseUser: null,
        checkEmailVerification: mockCheckEmailVerification,
      });
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleResendEmail();
      });

      expect(sendEmailVerification).not.toHaveBeenCalled();
    });

    it('sends verification email on success', async () => {
      (sendEmailVerification as jest.Mock).mockResolvedValueOnce({});
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleResendEmail();
      });

      expect(sendEmailVerification).toHaveBeenCalledWith({ uid: '123', email: 'test@example.com' });
      expect(result.current.successMsg).toContain('Verification email sent again');
      expect(result.current.resendLoading).toBe(false);
      expect(result.current.errorCode).toBeNull();
    });

    it('handles send verification error', async () => {
      (sendEmailVerification as jest.Mock).mockRejectedValueOnce({ code: 'auth/too-many-requests' });
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleResendEmail();
      });

      expect(result.current.errorCode).toBe('auth/too-many-requests');
      expect(result.current.resendLoading).toBe(false);
    });

    it('falls back to network-request-failed if no code is present on resend', async () => {
      (sendEmailVerification as jest.Mock).mockRejectedValueOnce(new Error('Unknown'));
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleResendEmail();
      });

      expect(result.current.errorCode).toBe('auth/network-request-failed');
    });
  });

  describe('handleSignOut', () => {
    it('calls auth.signOut', async () => {
      const { result } = renderHook(() => useUnverifiedScreen());

      await act(async () => {
        await result.current.handleSignOut();
      });

      expect(auth.signOut).toHaveBeenCalled();
    });
  });
});
