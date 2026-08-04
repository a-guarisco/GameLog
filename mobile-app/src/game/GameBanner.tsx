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
  const secondaryText = streak > 0 ? `🔥 ${streak} day streak` : '0 day streak';

  return (
    <VStack className="w-full bg-background-100 rounded-b-2xl shadow-lg border-b border-outline-100 overflow-hidden">
      <Box className="overflow-hidden">
        <Banner imageUrl={gameHeaderImage} minHeight={140} heightPercentage={18} />
      </Box>
      <BannerInfo title={title} iconUrl={gameCapsuleImage} secondaryText={secondaryText} />
    </VStack>
  );
}

