import React from 'react';
import { View } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { ErrorBox, SuccessBox } from '@gamelog/common/feedbacks';
import Ionicons from '@react-native-vector-icons/ionicons';
import { toHex } from '@gamelog/theme/themeHelpers';
import { brand } from '@gamelog/theme/theme';
import { getAuthErrorMessage } from '@gamelog/auth/authErrorMessages';
import { useUnverifiedScreen } from './useUnverifiedScreen';

export default function UnverifiedScreen() {
  const {
    firebaseUser,
    loading,
    resendLoading,
    errorCode,
    successMsg,
    handleCheckVerification,
    handleResendEmail,
    handleSignOut,
  } = useUnverifiedScreen();

  return (
    <View className="flex-1 bg-background-50 dark:bg-background-0 items-center justify-center p-6">
      <Box className="w-full max-w-[400px] items-center">
        <Ionicons name="mail-unread-outline" size={80} color={toHex(brand.primary['500'])} className="mb-4" />
        
        <Text size="2xl" bold className="text-center mb-2">
          Verify your Email
        </Text>
        
        <Text className="text-center text-typography-600 mb-8">
          We sent a verification link to{' '}
          <Text bold className="text-typography-900">{firebaseUser?.email}</Text>. 
          Click the link to activate your account and start using GameLog.
        </Text>

        <Box className="w-full gap-4">
          <Button onPress={handleCheckVerification} isDisabled={loading || resendLoading} size="lg">
            {loading ? <ButtonSpinner className="mr-2" /> : null}
            <ButtonText>I verified it, continue</ButtonText>
          </Button>

          <Button variant="outline" action="secondary" onPress={handleResendEmail} isDisabled={loading || resendLoading}>
            {resendLoading ? <ButtonSpinner className="mr-2" /> : null}
            <ButtonText>Resend email</ButtonText>
          </Button>

          <Button variant="link" action="negative" onPress={handleSignOut} className="mt-2">
            <ButtonText>Sign Out / Change Account</ButtonText>
          </Button>
        </Box>

        <Box className="mt-6 w-full">
          {errorCode ? <ErrorBox errorMessage={getAuthErrorMessage(errorCode)} /> : null}
          {successMsg ? <SuccessBox message={successMsg} /> : null}
        </Box>
      </Box>
    </View>
  );
}
