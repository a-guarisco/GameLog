import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';

export type GameScreenshot = {
  id: string;
  imageUrl: string;
  caption: string;
};

interface ScreenshotTileProps {
  screenshot: GameScreenshot;
}

const ScreenshotTile = ({ screenshot }: ScreenshotTileProps) => (
  <VStack space="xs" style={{ width: 176 }}>
    <Box className="overflow-hidden rounded-xl border border-outline-100 bg-background-200">
      <Image
        source={{ uri: screenshot.imageUrl }}
        alt={screenshot.caption}
        className="w-full h-32"
        resizeMode="cover"
      />
    </Box>
    <Text size="2xs" className="text-typography-300" numberOfLines={1}>
      {screenshot.caption}
    </Text>
  </VStack>
);

export default ScreenshotTile;
