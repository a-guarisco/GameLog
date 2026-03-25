import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';

const ProfileView = () => {
  return (
    <Box className="flex-1 items-center justify-center">
      <Text className="text-base">This is the profile!</Text>
      {/* <TotalHoursChart /> */}
      <OsShareChart />
    </Box>
  );
};

export default ProfileView;
