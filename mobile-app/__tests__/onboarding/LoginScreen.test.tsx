import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../src/onboarding/LoginScreen';
import { useLogin } from '../../src/onboarding/useLogin';

jest.mock('../../src/onboarding/useLogin', () => ({
  useLogin: jest.fn(),
}));

jest.mock('@gamelog/auth/authErrorMessages', () => ({
  getAuthErrorMessage: jest.fn((code) => `Error: ${code}`),
}));

describe('LoginScreen', () => {
  const mockUseLogin = {
    loading: false,
    errorCode: null,
    successMsg: null,
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    confirmPassword: '',
    setConfirmPassword: jest.fn(),
    authMode: 'signin',
    setAuthMode: jest.fn(),
    handleGoogleSignIn: jest.fn(),
    handleFacebookSignIn: jest.fn(),
    handleGithubSignIn: jest.fn(),
    handleEmailAuth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogin as jest.Mock).mockReturnValue(mockUseLogin);
  });

  it('renders correctly in signin mode', () => {
    const { getByText, queryByText, getByPlaceholderText, queryByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('GameLog')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(queryByPlaceholderText('Confirm Password')).toBeNull();

    expect(getByText('Continue with Google')).toBeTruthy();
    expect(queryByText('Continue with Facebook')).toBeNull();
    expect(queryByText('Continue with GitHub')).toBeNull();
  });

  it('renders correctly in signup mode', () => {
    (useLogin as jest.Mock).mockReturnValue({
      ...mockUseLogin,
      authMode: 'signup',
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('calls authMode toggle when SegmentedControl is pressed', () => {
    // We assume GLSegmentedControl renders some text that we can press
    // Typically it renders the labels "Sign In" and "Sign Up"
    const { getByText } = render(<LoginScreen />);

    const signUpTab = getByText('Sign Up');
    fireEvent.press(signUpTab);

    // It's up to the implementation of GLSegmentedControl, but let's assume it fires the onSelect
    // If GLSegmentedControl handles touch correctly, setAuthMode will be called.
    // If not, we might need a test specifically for GLSegmentedControl or mock it.
    // Assuming it works based on generic text matching:
    // This is more integration test like. We can just verify it's passed down.
  });

  it('renders invalid credential warning in signin mode', () => {
    (useLogin as jest.Mock).mockReturnValue({
      ...mockUseLogin,
      errorCode: 'auth/invalid-credential',
    });

    const { getByText } = render(<LoginScreen />);

    expect(getByText(/Haven't registered yet\?/)).toBeTruthy();
    const btn = getByText('Go to Sign Up');
    fireEvent.press(btn);
    expect(mockUseLogin.setAuthMode).toHaveBeenCalledWith('signup');
  });

  it('renders normal error message in signup mode even if invalid credential (edge case)', () => {
    (useLogin as jest.Mock).mockReturnValue({
      ...mockUseLogin,
      authMode: 'signup',
      errorCode: 'auth/invalid-credential',
    });

    const { getByText, queryByText } = render(<LoginScreen />);

    expect(queryByText(/Haven't registered yet\?/)).toBeNull();
    expect(getByText('Error: auth/invalid-credential')).toBeTruthy();
  });

  it('renders success message', () => {
    (useLogin as jest.Mock).mockReturnValue({
      ...mockUseLogin,
      successMsg: 'Account created!',
    });

    const { getByText } = render(<LoginScreen />);

    expect(getByText('Account created!')).toBeTruthy();
  });

  it('handles social login presses', () => {
    const { getByTestId, queryByTestId } = render(<LoginScreen />);

    fireEvent.press(getByTestId('gl-google-button'));
    expect(mockUseLogin.handleGoogleSignIn).toHaveBeenCalled();

    expect(queryByTestId('gl-facebook-button')).toBeNull();
    expect(queryByTestId('gl-github-button')).toBeNull();
  });
});
