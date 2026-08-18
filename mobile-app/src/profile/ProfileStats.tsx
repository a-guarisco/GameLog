import GameStatBand from '@gamelog/common/game/GameStatBand';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import { getProfileStats } from './profileSelectors';

/** Owned / played in the last two weeks / lifetime hours, in the same band the game view uses. */
const ProfileStats = ({ ownedGames }: { ownedGames?: OwnedGames | null }) => (
  <GameStatBand stats={getProfileStats(ownedGames)} />
);

export default ProfileStats;
