import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@gamelog/components/ui/text';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { ViewGL } from '@gamelog/common';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ViewGL align="center" gap="sm">
      <Text>This is the game list!</Text>
      <Button onPress={() => navigation.navigate('Game')}>
        <ButtonText>Go to Game</ButtonText>
      </Button>
    </ViewGL>
  );
};

export default GameListView;
