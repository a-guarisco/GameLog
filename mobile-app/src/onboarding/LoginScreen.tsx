import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { GLSegmentedControl, GLSegmentOption } from '@gamelog/common/GLSegmentedControl';
import { GLGoogleButton } from './GLGoogleButton';
import { ErrorBox, SuccessBox, WarningBox } from '@gamelog/common/feedbacks';
import { Divider } from '@gamelog/common/gluestack/divider';
import { Button, ButtonText } from '@gamelog/common/button';

import { getAuthErrorMessage } from '@gamelog/auth/authErrorMessages';
import { useLogin, AuthMode } from './useLogin';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export default function LoginScreen() {
  const {
    loading,
    errorCode,
    successMsg,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    authMode,
    setAuthMode,
    handleGoogleSignIn,
    handleEmailAuth,
  } = useLogin();

  const isInvalidCredential =
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/user-not-found' ||
    errorCode === 'auth/wrong-password';

  const authOptions: (GLSegmentOption<AuthMode> & { component: ReactNode })[] = [
    {
      id: 'signin',
      label: 'Sign In',
      component: (
        <SignInForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          onSubmit={handleEmailAuth}
        />
      ),
    },
    {
      id: 'signup',
      label: 'Sign Up',
      component: (
        <SignUpForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          loading={loading}
          onSubmit={handleEmailAuth}
        />
      ),
    },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-0 dark:bg-background-0"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Box className="w-full max-w-[400px] self-center">
          <Text size="3xl" bold className="text-center mb-6">
            GameLog
          </Text>

          {isInvalidCredential && authMode === 'signin' && (
            <Box className="mb-6">
              <WarningBox message="Haven't registered yet? The account doesn't exist or the credentials are incorrect." />
              <Button
                size="sm"
                variant="outline"
                action="primary"
                className="mt-3 mx-4"
                onPress={() => setAuthMode('signup')}
              >
                <ButtonText>Go to Sign Up</ButtonText>
              </Button>
            </Box>
          )}

          <GLSegmentedControl
            options={authOptions}
            activeId={authMode}
            onSelect={setAuthMode}
            className="mb-2"
          />

          {authOptions.find((opt) => opt.id === authMode)?.component}

          <Box className="my-6 flex-row items-center">
            <Divider className="flex-1" />
            <Text className="mx-4 text-typography-500 text-xs font-medium uppercase">OR</Text>
            <Divider className="flex-1" />
          </Box>

          <Box className="gap-3">
            <GLGoogleButton onPress={handleGoogleSignIn} isLoading={loading} />
          </Box>

          <Box className="mt-4">
            {errorCode && (!isInvalidCredential || authMode === 'signup') ? (
              <ErrorBox errorMessage={getAuthErrorMessage(errorCode)} />
            ) : null}
            {successMsg ? <SuccessBox message={successMsg} /> : null}
          </Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
