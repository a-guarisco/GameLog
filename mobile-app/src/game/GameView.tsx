import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import { Box } from '@gamelog/common/gluestack/box';
import { useRoute } from '@react-navigation/native';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import ScrollablePage from '@gamelog/common/ScrollablePage';

const GameView = () => {
  const route = useRoute<any>();
  const { gameItem } = route.params;
  const playerID = '76561198077919169'; //FIX
  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(gameItem.appid);
  const secondaryText = gameItem.streak > 0 ? `🔥 ${gameItem.streak} day streak` : '0 day streak';

  return (
    <Box className="flex-1 relative">
      <HeaderGameImage appid={gameItem.appid} />
      <ScrollablePage>
        <BannerInfo
          className="bg-background-100 shadow-xl"
          title={gameItem.name}
          iconUrl={gameCapsuleImage}
          secondaryText={secondaryText}
        />
        <Box className="items-center justify-start px-4 pt-4">
          <GlobalAchievementsPreview
            gameID={gameItem.appid}
            playerID={playerID}
            gameItem={gameItem}
          />
        </Box>
      </ScrollablePage>
    </Box>
  );
};

export default GameView;
