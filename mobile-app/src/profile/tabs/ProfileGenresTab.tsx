import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import type { OwnedGames } from '@gamelog/api-manager/dto';

interface ProfileGenresTabProps {
  ownedGames?: OwnedGames | null;
}

const ProfileGenresTab = ({ ownedGames }: ProfileGenresTabProps) => {
  return <GameGenreRadarChart ownedGames={ownedGames} />;
};

export default ProfileGenresTab;
