import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import { Button, ButtonText } from '@gamelog/components/ui/button';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <Box className="flex-1 items-center justify-center">
      <Text>This is the game list!</Text>
      <Button onPress={() => navigation.navigate('Game')}>
        <ButtonText>Go to Game</ButtonText>
      </Button>
    </Box>
  );
};

export default GameListView;
