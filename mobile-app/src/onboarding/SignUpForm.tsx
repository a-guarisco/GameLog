import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';

interface SignUpFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function SignUpForm({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit,
}: SignUpFormProps) {
  return (
    <Box className="w-full gap-4">
      <GLTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="signup-email-input"
      />
      <GLTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="signup-password-input"
      />
      <GLTextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        testID="signup-confirm-password-input"
      />

      <Button
        onPress={onSubmit}
        isDisabled={loading}
        className="w-full mt-2"
        size="lg"
        testID="signup-submit-button"
      >
        {loading ? <ButtonSpinner className="mr-2" /> : null}
        <ButtonText>Create Account</ButtonText>
      </Button>
    </Box>
  );
}
