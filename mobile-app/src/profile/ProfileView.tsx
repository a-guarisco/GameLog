import { TextGL, ViewGL } from '@gamelog/common';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';

const ProfileView = () => {
  return (
    <ViewGL align="center">
      <TextGL variant="body">This is the profile!</TextGL>
      <TotalHoursChart />
    </ViewGL>
  );
};

export default ProfileView;
