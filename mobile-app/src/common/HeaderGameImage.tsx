import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { Card } from '@gamelog/common/gluestack/card';
import { Box } from '@gamelog/common/gluestack/box';
import Banner from '@gamelog/common/Banner';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderGameImageProps {
  appid?: string;
}

const HeaderGameImage = ({ appid }: HeaderGameImageProps) => {
  const gameHeaderImage = appid ? steamAssetUrls.getGameHeaderImage(appid) : undefined;
  const { isLandscape } = useOrientation();
  const insets = useSafeAreaInsets();
  const leftOffset = isLandscape ? insets.left + 74 : 0;

  return (
    <Card
      variant="elevated"
      className="absolute top-0 right-0 z-0 border-b border-outline-100 overflow-hidden rounded-none p-0"
      style={{ left: leftOffset }}
    >
      <Box className="overflow-hidden">
        <Banner imageUrl={gameHeaderImage} minHeight={140} heightPercentage={18} />
      </Box>
    </Card>
  );
};

export default HeaderGameImage;
