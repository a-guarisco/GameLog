import StatBand from '@gamelog/common/StatBand';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import { getProfileStats } from './profileSelectors';

/** Owned / hours in the last two weeks / lifetime hours, in the same band the game view uses. */
const ProfileStats = ({
  ownedGames,
  recentMinutes = 0,
}: {
  ownedGames?: OwnedGames | null;
  /** Minutes played across the library in the last two weeks, from the backend report. */
  recentMinutes?: number;
}) => <StatBand stats={getProfileStats(ownedGames, recentMinutes)} />;

export default ProfileStats;
