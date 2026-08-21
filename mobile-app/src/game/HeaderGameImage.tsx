import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { Card } from '@gamelog/common/gluestack/card';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import Banner from '@gamelog/common/Banner';

interface HeaderGameImageProps {
  appid: string;
}

const HeaderGameImage = ({ appid }: HeaderGameImageProps) => {
  const gameHeaderImage = steamAssetUrls.getGameHeaderImage(appid);

  return (
    <Card
      variant="elevated"
      className="absolute top-0 left-0 right-0 w-full z-0 border-b border-outline-100 overflow-hidden rounded-none p-0"
    >
      <Box className="overflow-hidden">
        <Banner imageUrl={gameHeaderImage} minHeight={140} heightPercentage={18} />
      </Box>
    </Card>
  );
};

export default HeaderGameImage;
