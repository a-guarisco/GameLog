import { ScrollView } from 'react-native';
import { Box } from '@gamelog/components/ui/box';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';

const ProfileView = () => {
  return (
    <Box className="flex-1 items-center justify-center">
      <ScrollView>
        <GameGenreRadarChart />
        <TotalHoursChart />
        <TotalHoursPieChart />
        <OsShareChart />
      </ScrollView>
    </Box>
  );
};

export default ProfileView;
