import { TextGL, ViewGL } from '@gamelog/common';
import { useRoute } from '@react-navigation/native';

const GameView = () => {
  const route = useRoute();
  const { appid } = (route.params as { appid?: string }) ?? {};

  return (
    <ViewGL align="center">
      <TextGL variant="body">This is the game page! Here is the game ID! {appid}</TextGL>
    </ViewGL>
  );
};

export default GameView;
