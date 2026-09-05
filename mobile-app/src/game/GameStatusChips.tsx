import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import Chip from '@gamelog/common/Chip';
import { formatThousands } from '@gamelog/utils/formatUtils';
import { GameStatus } from '@gamelog/api-manager/dto';
import GameStatusSelectorChip from '@gamelog/game/GameStatusSelectorChip';

interface GameStatusChipsProps {
  livePlayers: number;
  streakText: string;
  appId?: string;
  status?: GameStatus | null;
  onStatusChange?: (newStatus: GameStatus) => void;
}

/**
 * Live player count and streak, sitting under the banner title. On the page background
 * rather than over the artwork, so the tokens resolve in both light and dark mode.
 */
const GameStatusChips = ({
  livePlayers,
  appId,
  status,
  onStatusChange,
}: GameStatusChipsProps) => (
  <HStack space="xs" className="flex-wrap items-center justify-center">
    {/* Solid fill rather than a tint: white on primary-500 holds its contrast in either theme. */}
    <Chip className="bg-primary-500">
      <Box className="h-1.5 w-1.5 rounded-full bg-white" />
      <Text size="xs" className="font-bold text-white">
        {formatThousands(livePlayers)} playing now
      </Text>
    </Chip>


    {appId && (
      <GameStatusSelectorChip
        appId={appId}
        initialStatus={status}
        onStatusChange={onStatusChange}
      />
    )}
  </HStack>
);

export default GameStatusChips;
