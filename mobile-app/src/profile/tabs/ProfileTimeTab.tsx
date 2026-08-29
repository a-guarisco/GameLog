import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import PlaytimeBlocksChart from '@gamelog/common/charts/playtime-blocks/PlaytimeBlocksChart';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import TotalHoursDoughnut from '@gamelog/common/charts/total-hours/TotalHoursDoughnut';
import { useOrientation } from '@gamelog/common/useOrientation';
import type { OwnedGames, PlaytimeByUser } from '@gamelog/api-manager/dto';

interface ProfileTimeTabProps {
  ownedGames?: OwnedGames | null;
  playtimeByUser?: PlaytimeByUser | null;
}

const ProfileTimeTab = ({ ownedGames, playtimeByUser }: ProfileTimeTabProps) => {
  const { isLandscape } = useOrientation();
  return (
    <VStack space={isLandscape ? 'xl' : 'md'} className="w-full items-center">
      <PlaytimeBlocksChart playtimeByUser={playtimeByUser} />
      <Box className="w-full">
        <TotalHoursChart ownedGames={ownedGames} />
      </Box>
      <TotalHoursDoughnut ownedGames={ownedGames} />
    </VStack>
  );
};

export default ProfileTimeTab;
