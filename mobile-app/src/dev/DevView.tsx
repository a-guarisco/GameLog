import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import { useNavigation } from '@react-navigation/core';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { Box } from '@gamelog/common/gluestack/box';
import { ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ErrorBox } from '@gamelog/common/feedbacks/ErrorBox';
import { InfoBox, LoadingBox, WarningBox } from '@gamelog/common/feedbacks';
import { BackendHealthCheck } from './BackendHealthCheck';
import { ExpoEnvInfo } from './ExpoEnvInfo';
import { FirebaseTokenGenerator } from './FirebaseTokenGenerator';
import { BackendTestAuth } from './BackendTestAuth';

export const DevView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newTheme);
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="flex-1 items-center justify-start gap-4 px-4 py-6">
          <ExpoEnvInfo />
          <Button onPress={toggleTheme} className="w-full max-w-[320px] self-center">
            <ButtonText>Toggle Theme : active = {isDarkMode ? 'Dark' : 'Light'}</ButtonText>
          </Button>
          <Button
            onPress={() => {
              navigation.navigate('DevPalette');
            }}
            className="w-full max-w-[320px] self-center"
          >
            <ButtonText>Go to Color Palette</ButtonText>
          </Button>
          <Button
            onPress={() => {
              navigation.navigate('DevFonts');
            }}
            className="w-full max-w-[320px] self-center"
          >
            <ButtonText>Go to Fonts</ButtonText>
          </Button>
          <BackendHealthCheck className="w-full max-w-[320px] self-center" />
          <FirebaseTokenGenerator />
          <BackendTestAuth className="w-full max-w-[320px] self-center" />
          <Box className="w-full max-w-[640px] flex-row flex-wrap justify-between gap-2">
            <ErrorBox className="w-[48%]" errorMessage="test error message" />
            <InfoBox className="w-[48%]" message="test info message" />
            <WarningBox className="w-[48%]" message="test warning message" />
            <LoadingBox className="w-[48%]" message="test loading message" />
          </Box>
        </Box>
      </ScrollView>
    </>
  );
};
