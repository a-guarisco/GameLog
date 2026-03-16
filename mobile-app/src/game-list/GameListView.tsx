import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';
import { TextGL, ViewGL } from '@gamelog/common';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ViewGL align="center" gap="sm">
      <TextGL variant="body">This is the game list!</TextGL>
      <Button title="Go to Game" onPress={() => navigation.navigate('Game')} />
    </ViewGL>
  );
};

export default GameListView;
