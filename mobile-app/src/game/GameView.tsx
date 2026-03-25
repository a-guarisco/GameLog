import GlobalAchievementsPreview from '@gamelog/components/game-view/GlobalAchievementsPreview';
import { Box } from '@gamelog/components/ui/box';

const GameView = ({ route }: any) => {
  const { gameItem } = route.params;
  const gameID = gameItem.appid;
  const playerID = '76561198077919169'; //FIX

  return (
    <Box className="flex-1 items-center justify-center">
      <GlobalAchievementsPreview gameID={gameID} playerID={playerID} />
    </Box>
  );
};

export default GameView;
