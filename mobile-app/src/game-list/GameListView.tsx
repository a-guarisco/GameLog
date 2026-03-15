import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { TextGL, ViewGL } from '../common';
import { Button } from 'react-native';
import { Text } from 'react-native';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ViewGL align="center" gap="sm">
      <Button title="Go to Game" onPress={() => navigation.navigate('Game')} />
    </ViewGL>
  );
};

export default GameListView;
