import { VStack } from '@gamelog/common/gluestack/vstack';
import PlaytimeTrendChart from '@gamelog/common/charts/playtime-trend/PlaytimeTrendChart';
import PlatformSplitChart from '@gamelog/common/charts/platform-split/PlatformSplitChart';
import { ReportBox } from '../../report/ReportBox';
import { useOrientation } from '@gamelog/common/useOrientation';
import type { PlaytimeByUser } from '@gamelog/api-manager/dto';
import type { PlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';

interface ProfileOverviewTabProps {
  playtimeByUser?: PlaytimeByUser | null;
  platformSplit: PlatformSplit;
  hasError?: boolean;
}

const ProfileOverviewTab = ({
  playtimeByUser,
  platformSplit,
  hasError = false,
}: ProfileOverviewTabProps) => {
  const { isLandscape } = useOrientation();
  return (
    <VStack space={isLandscape ? 'xl' : 'md'} className="w-full">
      <PlaytimeTrendChart playtimeByUser={playtimeByUser} />
      <ReportBox />
      <PlatformSplitChart split={platformSplit} hasError={hasError} />
    </VStack>
  );
};

export default ProfileOverviewTab;
