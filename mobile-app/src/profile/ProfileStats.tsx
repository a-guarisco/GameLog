import StatBand from '@gamelog/common/StatBand';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import { getProfileStats } from './profileSelectors';

const ProfileStats = ({
  ownedGames,
  recentMinutes = 0,
}: {
  ownedGames?: OwnedGames | null;
  recentMinutes?: number;
}) => <StatBand stats={getProfileStats(ownedGames, recentMinutes)} />;

export default ProfileStats;
