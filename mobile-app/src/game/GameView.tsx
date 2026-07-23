import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import { Box } from '@gamelog/common/gluestack/box';
import { useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native';

const GameView = () => {
  const route = useRoute<any>();
  const { gameItem } = route.params;
  const playerID = '76561198077919169'; //FIX

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      <Box className="items-center justify-start px-4 pt-4">
        <GlobalAchievementsPreview
          gameID={gameItem.appid}
          playerID={playerID}
          gameItem={gameItem}
        />
      </Box>
    </ScrollView>
  );
};

export default GameView;
