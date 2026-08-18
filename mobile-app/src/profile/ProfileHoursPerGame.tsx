import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/game/SectionCard';
import SectionState from '@gamelog/common/game/SectionState';
import type { TopGame } from './profileSelectors';

/** Plot height in px, matching the trend card above it so the two cards line up. */
const PLOT_HEIGHT = 96;
/** A game with a rounding-error share of the top game still deserves a visible column. */
const MIN_BAR_PERCENT = 6;

interface ProfileHoursPerGameProps {
  games: TopGame[];
  hasError?: boolean;
}

/**
 * The same ranking the overview lists, drawn as columns: side by side the gap between a
 * 400-hour game and a 90-hour one is the point, and horizontal tracks flatten it.
 */
const ProfileHoursPerGame = ({ games, hasError = false }: ProfileHoursPerGameProps) => (
  <SectionCard label="Hours per game" testID="profile-hours-per-game">
    <SectionState
      hasError={hasError}
      isEmpty={games.length === 0}
      errorMessage="Could not load playtime"
      emptyMessage="No playtime recorded yet"
    />

    <HStack space="sm" className="items-end">
      {games.map((game) => (
        <VStack key={game.appid} space="xs" className="flex-1 items-center">
          <Text size="2xs" className="font-bold text-typography-300">
            {game.hoursLabel}
          </Text>

          <Box className="w-full justify-end" style={{ height: PLOT_HEIGHT }}>
            <Box
              className="w-full rounded-t-md bg-primary-400"
              style={{
                height: `${Math.min(100, Math.max(MIN_BAR_PERCENT, game.percentOfTop))}%`,
              }}
              testID={`profile-hours-bar-${game.appid}`}
            />
          </Box>

          <Text
            size="2xs"
            className="w-full text-center font-bold uppercase text-typography-400"
            numberOfLines={1}
          >
            {game.name}
          </Text>
        </VStack>
      ))}
    </HStack>
  </SectionCard>
);

export default ProfileHoursPerGame;
