import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';

interface SignInFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
}: SignInFormProps) {
  return (
    <Box className="w-full gap-4">
      <GLTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="signin-email-input"
      />
      <GLTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="signin-password-input"
      />

      <Button
        onPress={onSubmit}
        isDisabled={loading}
        className="w-full mt-2"
        size="lg"
        testID="signin-submit-button"
      >
        {loading ? <ButtonSpinner className="mr-2" /> : null}
        <ButtonText>Sign In with Email</ButtonText>
      </Button>
    </Box>
  );
}
