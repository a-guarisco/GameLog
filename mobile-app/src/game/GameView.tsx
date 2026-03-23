import { TextGL, ViewGL } from '@gamelog/common';
import { VStack } from '@gamelog/components/ui/vstack';
import GlobalAchievementsPreview from '@gamelog/components/game-view/GlobalAchievementsPreview';

const GameView = () => {
  // todo a prop will provide these from the GameList page
  const gameID = 236390;
  const playerID = '76561198077919169';

  return (
    <VStack className="flex-1 p-4">
      <ViewGL align="center">
        <TextGL variant="body">This is the game page!</TextGL>
      </ViewGL>
      <GlobalAchievementsPreview gameID={gameID} playerID={playerID} />
    </VStack>
  );
};

export default GameView;
