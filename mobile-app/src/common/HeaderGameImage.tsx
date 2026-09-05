import { StyleProp, ViewStyle } from 'react-native';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { Card } from '@gamelog/common/gluestack/card';
import { Box } from '@gamelog/common/gluestack/box';
import Banner from '@gamelog/common/Banner';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavRailOffset } from './navConstants';

interface HeaderGameImageProps {
  appid?: string;
  compact?: boolean;
  contained?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  height?: number;
  scrollable?: boolean;
}

const HeaderGameImage = ({
  appid,
  compact = false,
  contained = false,
  className = '',
  style,
  height,
  scrollable = false,
}: HeaderGameImageProps) => {
  const gameHeaderImage = appid ? steamAssetUrls.getGameHeaderImage(appid) : undefined;
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const leftOffset = getNavRailOffset({ isLandscape, isTablet, insetsLeft: insets.left });

  const minHeight = isTablet ? 260 : compact ? 100 : 140;
  const heightPercentage = isTablet ? 26 : compact ? 12 : 18;
  const isScrollable = scrollable || isTablet;

  if (contained) {
    return (
      <Card
        variant="elevated"
        className={`w-full relative border-b border-outline-100 overflow-hidden rounded-none p-0 ${className}`}
        style={[{ height }, style]}
      >
        <Box className="w-full h-full overflow-hidden">
          <Banner
            imageUrl={gameHeaderImage}
            minHeight={minHeight}
            heightPercentage={heightPercentage}
            height={height}
            scrollable={isScrollable}
          />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className={`absolute top-0 right-0 z-0 border-b border-outline-100 overflow-hidden rounded-none p-0 ${className}`}
      style={[{ left: leftOffset }, style]}
    >
      <Box className="w-full overflow-hidden">
        <Banner
          imageUrl={gameHeaderImage}
          minHeight={minHeight}
          heightPercentage={heightPercentage}
          height={height}
          scrollable={isScrollable}
        />
      </Box>
    </Card>
  );
};

export default HeaderGameImage;
