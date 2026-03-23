import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import { useNavigation } from '@react-navigation/core';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';

export const DevView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <>
      <Box className="flex-1 bg-background-950 items-left justify-center gap-4">
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
      </Box>
    </>
  );
};
