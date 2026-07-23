import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import Banner from '@gamelog/common/Banner';

interface GameBannerProps {
  appid: string;
  title: string;
  streak: number;
}

export default function GameBanner({ appid, title, streak }: GameBannerProps) {
  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(appid);
  const gameHeaderImage = steamAssetUrls.getGameHeaderImage(appid);
  const secondaryText = streak > 0 ? `🔥 ${streak} day streak` : 'No streak yet';

  return (
    <VStack className="w-full">
      <Box className="overflow-hidden">
        <Banner imageUrl={gameHeaderImage} minHeight={150} heightPercentage={20} />
      </Box>
      <BannerInfo title={title} iconUrl={gameCapsuleImage} secondaryText={secondaryText} />
    </VStack>
  );
}
