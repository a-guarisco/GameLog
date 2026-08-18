import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import ProgressTrack from '@gamelog/common/game/ProgressTrack';
import SectionCard from '@gamelog/common/game/SectionCard';
import SectionState from '@gamelog/common/game/SectionState';
import type { TopGame } from './profileSelectors';

interface ProfileTopGamesProps {
  games: TopGame[];
  /** A failed library fetch must not read as "you have played nothing". */
  hasError?: boolean;
}

/** The library's longest sessions, ranked against the top game so the first bar is always full. */
const ProfileTopGames = ({ games, hasError = false }: ProfileTopGamesProps) => (
  <SectionCard label="Top games by hours" testID="profile-top-games">
    <SectionState
      hasError={hasError}
      isEmpty={games.length === 0}
      errorMessage="Could not load playtime"
      emptyMessage="No playtime recorded yet"
    />

    <VStack space="md">
      {games.map((game) => (
        <VStack key={game.appid} space="xs">
          <HStack space="sm" className="items-center justify-between">
            <Text size="xs" className="shrink font-bold text-typography-0" numberOfLines={1}>
              {game.name}
            </Text>
            <Text size="xs" className="font-bold text-typography-200">
              {game.hoursLabel}
            </Text>
          </HStack>
          <ProgressTrack
            percent={game.percentOfTop}
            className="h-1"
            testID={`profile-top-game-fill-${game.appid}`}
          />
        </VStack>
      ))}
    </VStack>
  </SectionCard>
);

export default ProfileTopGames;
