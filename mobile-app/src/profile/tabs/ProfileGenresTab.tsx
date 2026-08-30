import { VStack } from '@gamelog/common/gluestack/vstack';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import CommunityGenreRadarChart from '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart';
import type { OwnedGames } from '@gamelog/api-manager/dto';

interface ProfileGenresTabProps {
  ownedGames?: OwnedGames | null;
}

const ProfileGenresTab = ({ ownedGames }: ProfileGenresTabProps) => {
  return (
    <VStack space="md" className="w-full">
      <GameGenreRadarChart ownedGames={ownedGames} />
      <CommunityGenreRadarChart ownedGames={ownedGames} />
    </VStack>
  );
};

export default ProfileGenresTab;

