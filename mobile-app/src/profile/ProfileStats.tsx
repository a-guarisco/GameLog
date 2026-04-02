import { Box } from '@gamelog/components/ui/box';
import { StatTile } from '../common/StatTile';

const statsTiles = [
  <StatTile
    value="160"
    label="Games Owned"
    className="bg-background-200"
    valueClassName="text-typography-900"
    labelClassName="text-typography-300"
    key="GamesOwned"
  />,
  <StatTile
    value="18"
    label="Played in Last 2 Weeks"
    className="bg-primary-500"
    valueClassName="text-typography-200"
    labelClassName="text-secondary-100"
    key="PlayedLast2Weeks"
  />,
  <StatTile
    value="10"
    label="Games Completed"
    className="bg-secondary-500"
    valueClassName="text-typography-100"
    labelClassName="text-tertiary-100"
    key="GamesCompleted"
  />,
];

const ProfileStats = () => {
  return (
    <Box className="flex-row flex-wrap">
      {statsTiles.map((tile, i) => (
        <Box key={i} className="w-1/3 p-2">
          {tile}
        </Box>
      ))}
    </Box>
  );
};

export default ProfileStats;
