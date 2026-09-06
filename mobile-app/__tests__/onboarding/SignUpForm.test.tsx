import { render, fireEvent } from '@testing-library/react-native';
import { SignUpForm } from '../../src/onboarding/SignUpForm';

describe('SignUpForm', () => {
  it('renders correctly and handles input', () => {
    const setEmailMock = jest.fn();
    const setPasswordMock = jest.fn();
    const setConfirmPasswordMock = jest.fn();
    const onSubmitMock = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <SignUpForm
        email="test@example.com"
        setEmail={setEmailMock}
        password="password123"
        setPassword={setPasswordMock}
        confirmPassword="password123"
        setConfirmPassword={setConfirmPasswordMock}
        loading={false}
        onSubmit={onSubmitMock}
      />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmPasswordInput.props.value).toBe('password123');

    fireEvent.changeText(emailInput, 'new@example.com');
    expect(setEmailMock).toHaveBeenCalledWith('new@example.com');

    fireEvent.changeText(passwordInput, 'newpass');
    expect(setPasswordMock).toHaveBeenCalledWith('newpass');

    fireEvent.changeText(confirmPasswordInput, 'newpass2');
    expect(setConfirmPasswordMock).toHaveBeenCalledWith('newpass2');

    const submitBtn = getByText('Create Account');
    fireEvent.press(submitBtn);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state', () => {
    const { getByText } = render(
      <SignUpForm
        email=""
        setEmail={jest.fn()}
        password=""
        setPassword={jest.fn()}
        confirmPassword=""
        setConfirmPassword={jest.fn()}
        loading={true}
        onSubmit={jest.fn()}
      />
    );

    const submitBtn = getByText('Create Account');
    expect(submitBtn).toBeTruthy();
  });
});
