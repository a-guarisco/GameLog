import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';
import { Input, InputField } from '@gamelog/common/gluestack/input';
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
      className="flex-1 bg-background-0"
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
            <Box>
              <Text className="mb-2 font-medium">Username *</Text>
              <Input className="h-12">
                <InputField
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </Input>
            </Box>

            <Box>
              <Text className="mb-2 font-medium">Steam ID *</Text>
              <Input className="h-12">
                <InputField
                  placeholder="e.g. 76561197960287930"
                  value={steamId}
                  onChangeText={setSteamId}
                  keyboardType="numeric"
                />
              </Input>
              <Text size="xs" className="text-typography-400 mt-1">
                Your 17-digit Steam ID64.
              </Text>
            </Box>

            <Box>
              <Text className="mb-2 font-medium">Steam API Key (Optional)</Text>
              <Input className="h-12">
                <InputField
                  placeholder="Enter API Key to sync private games"
                  value={steamApiKey}
                  onChangeText={setSteamApiKey}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </Input>
              <Text size="xs" className="text-typography-400 mt-1">
                Required only if you want to sync your Steam library automatically. You can add it
                later in Settings.
              </Text>
            </Box>
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
