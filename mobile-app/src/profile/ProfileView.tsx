import { FlatList } from 'react-native';
import { Box } from '@gamelog/components/ui/box';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import ProfileBanner from '@gamelog/components/profile-view/ProfileBanner';
import { StatTile } from './StatTile';

const statsTiles = [
  <StatTile
    value="160"
    label="Games Owned"
    className="bg-background-200"
    valueClassName="text-typography-900"
    labelClassName="text-typography-300"
  />,

  <StatTile
    value="18"
    label="Played in Last 2 Weeks"
    className="bg-primary-500"
    valueClassName="text-typography-200"
    labelClassName="text-secondary-100"
  />,
  <StatTile
    value="10"
    label="Games Completed"
    className="bg-secondary-500"
    valueClassName="text-typography-100"
    labelClassName="text-tertiary-100"
  />,
];

const chartComponents = [
  <Box className="flex-row flex-wrap">
    {statsTiles.map((tile, i) => (
      <Box key={i} className="w-1/3 p-2">
        {tile}
      </Box>
    ))}
  </Box>,
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
