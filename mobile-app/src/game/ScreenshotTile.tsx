import { Card } from '@gamelog/common/gluestack/card';
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
    <Card variant="outline" className="overflow-hidden rounded-xl p-0">
      <Image
        source={{ uri: screenshot.imageUrl }}
        alt={screenshot.caption}
        className="w-full h-32"
        resizeMode="cover"
      />
    </Card>
    <Text size="2xs" className="text-typography-200" numberOfLines={1}>
      {screenshot.caption}
    </Text>
  </VStack>
);

export default ScreenshotTile;
