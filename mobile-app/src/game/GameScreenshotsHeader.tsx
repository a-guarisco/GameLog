import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatThousands } from '@gamelog/utils/formatUtils';

interface GameScreenshotsHeaderProps {
  totalCount: number;
}

const GameScreenshotsHeader = ({ totalCount }: GameScreenshotsHeaderProps) => (
  <HStack className="items-center justify-between px-4">
    <Text
      size="2xs"
      className="font-bold uppercase text-typography-300 text-center"
      style={{ letterSpacing: 1.2 }}
    >
      Community in-game screenshots
    </Text>
    {totalCount > 0 && (
      <Text size="xs" className="font-bold text-typography-300">
        {formatThousands(totalCount)} total
      </Text>
    )}
  </HStack>
);

export default GameScreenshotsHeader;
