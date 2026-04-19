import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { VStack } from '@gamelog/common/gluestack/vstack';
import Banner from '@gamelog/common/Banner';

interface GameBannerProps {
  appid: string;
  title: string;
  streak: number;
}

export default function GameBanner({ appid, title, streak }: GameBannerProps) {
  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(appid);
  const gameHeaderImage = steamAssetUrls.getGameHeaderImage(appid);
  const secondaryText = streak !== 0 ? `🔥 ${streak} streak` : `${streak} streak`;

  return (
    <VStack className="w-full">
      <Banner imageUrl={gameHeaderImage} minHeight={150} heightPercentage={20} />
      <BannerInfo title={title} iconUrl={gameCapsuleImage} secondaryText={secondaryText} />
    </VStack>
  );
}
