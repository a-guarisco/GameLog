import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { TextGL, ViewGL } from '../common';
import { Button } from 'react-native';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ViewGL>
      <TextGL>This is the game list!</TextGL>
      <Button title="Go to Game" onPress={() => navigation.navigate('Game')} />
    </ViewGL>
  );
};

export default GameListView;
