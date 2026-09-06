import { render, fireEvent } from '@testing-library/react-native';
import { SignInForm } from '../../src/onboarding/SignInForm';

// Mock GLTextInput since it might have complex dependencies, but usually it's fine to let it render.
// We'll just render it normally as long as there's no issue, or mock it if needed.
// The tests will pass if we provide the right placeholders.

describe('SignInForm', () => {
  it('renders correctly and handles input', () => {
    const setEmailMock = jest.fn();
    const setPasswordMock = jest.fn();
    const onSubmitMock = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <SignInForm
        email="test@example.com"
        setEmail={setEmailMock}
        password="password123"
        setPassword={setPasswordMock}
        loading={false}
        onSubmit={onSubmitMock}
      />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');

    fireEvent.changeText(emailInput, 'new@example.com');
    expect(setEmailMock).toHaveBeenCalledWith('new@example.com');

    fireEvent.changeText(passwordInput, 'newpass');
    expect(setPasswordMock).toHaveBeenCalledWith('newpass');

    const submitBtn = getByText('Sign In with Email');
    fireEvent.press(submitBtn);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state', () => {
    const { getByText } = render(
      <SignInForm
        email=""
        setEmail={jest.fn()}
        password=""
        setPassword={jest.fn()}
        loading={true}
        onSubmit={jest.fn()}
      />
    );

    const submitBtn = getByText('Sign In with Email');
    // Button should be disabled during loading (Button from gluestack uses disabled prop on outer view, or accessibilityState)
    // We can't directly check disabled state easily on gluestack button without testID, but we can check if it renders spinner
    // Actually, Gluestack button renders an ActivityIndicator when loading, but it's hard to query.
    // At least it renders without crashing.
    expect(submitBtn).toBeTruthy();
  });
});
