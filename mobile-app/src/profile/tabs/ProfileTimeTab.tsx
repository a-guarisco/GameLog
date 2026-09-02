import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
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
  const [doughnutHeight, setDoughnutHeight] = useState<number | undefined>(undefined);

  return (
    <VStack space={isLandscape ? 'xl' : 'md'} className="w-full items-center">
      <PlaytimeBlocksChart playtimeByUser={playtimeByUser} />
      {!isLandscape ? (
        <>
          <Box className="w-full">
            <TotalHoursChart ownedGames={ownedGames} />
          </Box>
          <TotalHoursDoughnut ownedGames={ownedGames} />
        </>
      ) : (
        <HStack space="md" className="w-full items-start">
          <Box className="w-[40%]">
            <TotalHoursChart ownedGames={ownedGames} targetHeight={doughnutHeight} />
          </Box>
          <Box
            className="w-[60%] flex-1"
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && h !== doughnutHeight) {
                setDoughnutHeight(h);
              }
            }}
          >
            <TotalHoursDoughnut ownedGames={ownedGames} />
          </Box>
        </HStack>
      )}
    </VStack>
  );
};

export default ProfileTimeTab;
