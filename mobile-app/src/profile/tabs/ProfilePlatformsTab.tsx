import { Box } from '@gamelog/common/gluestack/box';
import PlatformSplitChart from '@gamelog/common/charts/platform-split/PlatformSplitChart';
import type { PlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';

interface ProfilePlatformsTabProps {
  platformSplit: PlatformSplit;
  hasError: boolean;
}

const ProfilePlatformsTab = ({ platformSplit, hasError }: ProfilePlatformsTabProps) => {
  return (
    <Box className="w-full">
      <PlatformSplitChart split={platformSplit} hasError={hasError} />
    </Box>
  );
};

export default ProfilePlatformsTab;
