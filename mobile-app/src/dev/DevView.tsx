import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import { useNavigation } from '@react-navigation/core';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { Box } from '@gamelog/components/ui/box';
import { useColorScheme } from 'nativewind';
import { ErrorBox } from '@gamelog/common/feedbacks/ErrorBox';
import { InfoBox, LoadingBox, WarningBox } from '@gamelog/common/feedbacks';

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
      <Box className="flex-1 items-left justify-center gap-4">
        <Button onPress={toggleTheme}>
          <ButtonText>Toggle Theme : active = {isDarkMode ? 'Dark' : 'Light'}</ButtonText>
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('DevPalette');
          }}
        >
          <ButtonText>Go to Color Palette</ButtonText>
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('DevFonts');
          }}
        >
          <ButtonText>Go to Fonts</ButtonText>
        </Button>
        <ErrorBox errorMessage="test error message" />
        <InfoBox message="test info message" />
        <WarningBox message="test warning message" />
        <LoadingBox message="test loading message" />
      </Box>
    </>
  );
};
