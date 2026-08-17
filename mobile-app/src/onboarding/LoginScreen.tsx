import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { ErrorBox, SuccessBox } from '@gamelog/common/feedbacks';
import { Divider } from '@gamelog/common/gluestack/divider';
import { useLogin } from './useLogin';

export default function LoginScreen() {
  const {
    loading,
    errorMsg,
    successMsg,
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    handleGoogleSignIn,
    handleEmailAuth,
  } = useLogin();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-0"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Box className="w-full max-w-[400px] self-center">
          <Text size="3xl" bold className="text-center mb-8">
            GameLog
          </Text>

          <Button
            onPress={handleGoogleSignIn}
            isDisabled={loading}
            className="w-full mb-6"
            size="xl"
          >
            {loading ? <ButtonSpinner className="mr-2" /> : null}
            <ButtonText>Sign in with Google</ButtonText>
          </Button>

          <Box className="flex-row items-center mb-6">
            <Divider className="flex-1" />
            <Text className="mx-4 text-typography-500 text-sm">OR</Text>
            <Divider className="flex-1" />
          </Box>

          <Box className="gap-4 mb-6">
            <GLTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <GLTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Box>

          <Button onPress={handleEmailAuth} isDisabled={loading} className="w-full mb-4" size="lg">
            {loading ? <ButtonSpinner className="mr-2" /> : null}
            <ButtonText>{isSignUp ? 'Sign Up' : 'Sign In with Email'}</ButtonText>
          </Button>

          <Button variant="link" onPress={() => setIsSignUp(!isSignUp)} isDisabled={loading}>
            <ButtonText>
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </ButtonText>
          </Button>

          <Box className="mt-4">
            {errorMsg ? <ErrorBox errorMessage={errorMsg} /> : null}
            {successMsg ? <SuccessBox message={successMsg} /> : null}
          </Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
