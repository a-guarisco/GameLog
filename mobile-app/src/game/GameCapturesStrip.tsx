import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Image } from '@gamelog/common/gluestack/image';
import { SectionSpinner } from '@gamelog/common/game/SectionState';
import { formatThousands } from '@gamelog/utils/formatUtils';

export type GameCapture = {
  id: string;
  imageUrl: string;
  caption: string;
};

interface GameCapturesStripProps {
  captures: GameCapture[];
  totalCount: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
}

/** How close to the right edge (px) the scroll has to get before the next page is asked for. */
const END_REACHED_THRESHOLD = 240;

const CaptureTile = ({ capture }: { capture: GameCapture }) => (
  <VStack space="xs" style={{ width: 176 }}>
    <Box className="overflow-hidden rounded-xl border border-outline-100 bg-background-200">
      <Image
        source={{ uri: capture.imageUrl }}
        alt={capture.caption}
        className="w-full h-32"
        resizeMode="cover"
      />
    </Box>
    <Text size="2xs" className="text-typography-300" numberOfLines={1}>
      {capture.caption}
    </Text>
  </VStack>
);

const GameCapturesStrip = ({
  captures,
  totalCount,
  isLoading = false,
  isLoadingMore = false,
  onEndReached,
}: GameCapturesStripProps) => {
  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onEndReached) return;
    const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
    const distanceToEnd = contentSize.width - (contentOffset.x + layoutMeasurement.width);
    if (distanceToEnd <= END_REACHED_THRESHOLD) onEndReached();
  };

  return (
    <VStack space="sm">
      <HStack className="items-center justify-between px-4">
        <Text
          size="2xs"
          className="font-bold uppercase text-typography-300 text-center"
          style={{ letterSpacing: 1.2 }}
        >
          Community in-game screenshot
        </Text>
        {totalCount > 0 && (
          <Text size="xs" className="font-bold text-typography-300">
            {formatThousands(totalCount)} total
          </Text>
        )}
      </HStack>

      {isLoading && captures.length === 0 ? (
        <SectionSpinner className="h-[99px] items-center justify-center px-4" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {captures.map((capture) => (
            <CaptureTile key={capture.id} capture={capture} />
          ))}
          {isLoadingMore && (
            <SectionSpinner className="h-[99px] w-16 items-center justify-center" />
          )}
        </ScrollView>
      )}
    </VStack>
  );
};

export default GameCapturesStrip;
