import StatBand from '@gamelog/common/StatBand';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import { selectProfileStats } from './selectProfile';

const ProfileStats = ({
  ownedGames,
  recentMinutes = 0,
}: {
  ownedGames?: OwnedGames | null;
  recentMinutes?: number;
}) => <StatBand stats={selectProfileStats(ownedGames, recentMinutes)} />;

export default ProfileStats;
