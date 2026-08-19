import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { ErrorBox } from '@gamelog/common/feedbacks';
import { useProfileSetup } from './useProfileSetup';

export default function ProfileSetupScreen() {
  const {
    loading,
    errorMsg,
    username,
    setUsername,
    steamId,
    setSteamId,
    steamApiKey,
    setSteamApiKey,
    handleRegister,
    handleSignOut,
  } = useProfileSetup();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-0 dark:bg-background-0"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <Box className="w-full max-w-[400px] self-center">
          <Text size="3xl" bold className="text-center mb-2">
            Complete Profile
          </Text>
          <Text className="text-center text-typography-500 mb-8">
            Set up your gamer profile to continue.
          </Text>

          <Box className="gap-5 mb-8">
            <GLTextInput
              label="Username *"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <GLTextInput
              label="Steam ID *"
              placeholder="e.g. 76561197960287930"
              value={steamId}
              onChangeText={setSteamId}
              keyboardType="numeric"
              helperText="Your 17-digit Steam ID64."
            />

            <GLTextInput
              label="Steam API Key (Optional)"
              placeholder="Enter API Key to sync private games"
              value={steamApiKey}
              onChangeText={setSteamApiKey}
              autoCapitalize="none"
              secureTextEntry
              helperText="Required only if you want to sync your Steam library automatically. You can add it later in Settings."
            />
          </Box>

          <Button onPress={handleRegister} isDisabled={loading} className="w-full mb-4" size="xl">
            {loading ? <ButtonSpinner className="mr-2" /> : null}
            <ButtonText>Complete Setup</ButtonText>
          </Button>

          <Button variant="link" onPress={handleSignOut} isDisabled={loading}>
            <ButtonText className="text-error-500">Cancel & Sign Out</ButtonText>
          </Button>

          <Box className="mt-4">{errorMsg ? <ErrorBox errorMessage={errorMsg} /> : null}</Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
