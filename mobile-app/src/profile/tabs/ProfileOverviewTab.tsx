import { VStack } from '@gamelog/common/gluestack/vstack';
import PlaytimeTrendChart from '@gamelog/common/charts/playtime-trend/PlaytimeTrendChart';
import { ReportBox } from '../../report/ReportBox';
import type { PlaytimeByUser } from '@gamelog/api-manager/dto';

interface ProfileOverviewTabProps {
  playtimeByUser?: PlaytimeByUser | null;
}

const ProfileOverviewTab = ({ playtimeByUser }: ProfileOverviewTabProps) => {
  return (
    <VStack space="md" className="w-full">
      <PlaytimeTrendChart playtimeByUser={playtimeByUser} />
      <ReportBox />
    </VStack>
  );
};

export default ProfileOverviewTab;
