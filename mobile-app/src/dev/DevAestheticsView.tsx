import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { ErrorBox, InfoBox, LoadingBox, SuccessBox, WarningBox } from '@gamelog/common/feedbacks';

export const DevAestheticsView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newTheme);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-start gap-2.5 px-4 py-4">
        <Box className="mb-1">
          <Text className="text-xl font-bold text-typography-0">Aesthetics & Theme</Text>
        </Box>

        {/* Theme Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2  rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Theme Mode</Text>
          <Button isOnCard onPress={toggleTheme} className="w-full">
            <ButtonText>Toggle Theme : active = {isDarkMode ? 'Dark' : 'Light'}</ButtonText>
          </Button>
        </Card>

        {/* Design Assets Navigation Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2  rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Design System References</Text>
          <Box className="gap-2">
            <Button
              onPress={() => {
                navigation.navigate('DevPalette');
              }}
              className="w-full"
            >
              <ButtonText>Go to Color Palette</ButtonText>
            </Button>
            <Button
              onPress={() => {
                navigation.navigate('DevFonts');
              }}
              className="w-full"
            >
              <ButtonText>Go to Fonts</ButtonText>
            </Button>
          </Box>
        </Card>

        {/* Feedback Previews Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2  rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">
            Feedback Component Sandbox
          </Text>
          <Box className="w-full gap-2">
            <SuccessBox message="Sample success message" />
            <ErrorBox errorMessage="Sample error message" />
            <InfoBox message="Sample info message" />
            <WarningBox message="Sample warning message" />
            <LoadingBox message="Sample loading message" />
          </Box>
        </Card>
      </Box>
    </ScrollView>
  );
};
