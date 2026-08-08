import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import Banner from '@gamelog/common/Banner';

interface HeaderGameImageProps {
  appid: string;
}

const HeaderGameImage = ({ appid }: HeaderGameImageProps) => {
  const gameHeaderImage = steamAssetUrls.getGameHeaderImage(appid);

  return (
    <VStack className="absolute top-0 left-0 right-0 w-full z-0 bg-background-100 shadow-lg border-b border-outline-100 overflow-hidden">
      <Box className="overflow-hidden">
        <Banner imageUrl={gameHeaderImage} minHeight={140} heightPercentage={18} />
      </Box>
    </VStack>
  );
};

export default HeaderGameImage;
