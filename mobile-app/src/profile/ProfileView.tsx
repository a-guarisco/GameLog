import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';

const ProfileView = () => {
  return (
    <Box className="flex-1 items-center justify-center">
      <Text className="text-base">This is the profile!</Text>
      <TotalHoursChart />
    </Box>
  );
};

export default ProfileView;
