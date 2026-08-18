import { ScrollView } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { SectionSpinner } from '@gamelog/common/SectionState';
import ScreenshotTile, { GameScreenshot } from '@gamelog/game/ScreenshotTile';
import GameScreenshotsHeader from '@gamelog/game/GameScreenshotsHeader';
import useHorizontalScrollEnd from '@gamelog/game/useHorizontalScrollEnd';

export type { GameScreenshot };

interface GameScreenshotsStripProps {
  screenshots: GameScreenshot[];
  totalCount: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
}

const GameScreenshotsStrip = ({
  screenshots,
  totalCount,
  isLoading = false,
  isLoadingMore = false,
  onEndReached,
}: GameScreenshotsStripProps) => {
  const { handleScroll } = useHorizontalScrollEnd(onEndReached);

  return (
    <VStack space="sm">
      <GameScreenshotsHeader totalCount={totalCount} />

      {isLoading && screenshots.length === 0 ? (
        <SectionSpinner className="h-[99px] items-center justify-center px-4" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {screenshots.map((screenshot) => (
            <ScreenshotTile key={screenshot.id} screenshot={screenshot} />
          ))}
          {isLoadingMore && (
            <SectionSpinner className="h-[99px] w-16 items-center justify-center" />
          )}
        </ScrollView>
      )}
    </VStack>
  );
};

export default GameScreenshotsStrip;
