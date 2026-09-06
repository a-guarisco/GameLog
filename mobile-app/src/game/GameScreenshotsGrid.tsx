import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Image } from '@gamelog/common/gluestack/image';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { SectionSpinner } from '@gamelog/common/SectionState';
import GameScreenshotsHeader from '@gamelog/game/GameScreenshotsHeader';
import { GameScreenshot } from '@gamelog/game/ScreenshotTile';

interface GameScreenshotsGridProps {
  screenshots: GameScreenshot[];
  totalCount: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

const GameScreenshotsGrid = ({
  screenshots,
  totalCount,
  isLoading = false,
  isLoadingMore = false,
}: GameScreenshotsGridProps) => {
  return (
    <VStack space="md" className="w-full pb-6">
      <GameScreenshotsHeader totalCount={totalCount} />

      {isLoading && screenshots.length === 0 ? (
        <SectionSpinner className="h-32 items-center justify-center px-4" />
      ) : (
        <HStack className="w-full flex-wrap justify-between gap-y-3">
          {screenshots.map((screenshot) => (
            <Box key={screenshot.id} className="w-[48%]">
              <VStack space="xs">
                <Card variant="outline" className="overflow-hidden rounded-xl p-0">
                  <Image
                    source={{ uri: screenshot.imageUrl }}
                    alt={screenshot.caption}
                    className="w-full h-28"
                    resizeMode="cover"
                  />
                </Card>
                {screenshot.caption ? (
                  <Text size="2xs" className="text-typography-200" numberOfLines={1}>
                    {screenshot.caption}
                  </Text>
                ) : null}
              </VStack>
            </Box>
          ))}
        </HStack>
      )}

      {isLoadingMore && <SectionSpinner className="h-12 w-full items-center justify-center my-2" />}
    </VStack>
  );
};

export default GameScreenshotsGrid;
