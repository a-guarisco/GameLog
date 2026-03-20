import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';
import { useNavigation } from '@react-navigation/core';
import { ViewGL } from '@gamelog/common';
import { Button, ButtonText } from '@gamelog/components/ui/button';

export const ThemeView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ViewGL align="center" gap="md">
      <Button
        onPress={() => {
          navigation.navigate('DevPalette');
        }}
      >
        <ButtonText>Go to Color Palette</ButtonText>
      </Button>
    </ViewGL>
  );
};
