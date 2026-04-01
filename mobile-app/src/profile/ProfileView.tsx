import { FlatList } from 'react-native';
import { Box } from '@gamelog/components/ui/box';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import ProfileBanner from '@gamelog/components/profile-view/ProfileBanner';

const chartComponents = [
  <TotalHoursChart key="TotalHoursChart" />,
  <TotalHoursPieChart key="TotalHoursPieChart" />,
  <OsShareChart key="OsShareChart" />,
];

const ProfileView = () => {
  return (
    <>
      <ProfileBanner userId={'76561198077919169'} />
      <FlatList
        data={chartComponents}
        renderItem={({ item }) => (
          <Box style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>{item}</Box>
        )}
        keyExtractor={(item, index) => item.key ?? `${index}`}
      />
    </>
  );
};

export default ProfileView;
