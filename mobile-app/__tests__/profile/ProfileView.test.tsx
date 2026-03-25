import { render, screen } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';

jest.mock('@gamelog/common/charts/total-hours/TotalHoursChart', () => () => null);
jest.mock('@gamelog/common/charts/total-hours/TotalHoursPieChart', () => () => null);
jest.mock('@gamelog/common/charts/os-share/OsShareChart', () => () => null);

describe('Profile', () => {
  jest.mock('react-native-gifted-charts')
  it('renders without crashing', () => {
    render(<ProfileView />);
  });

  it('displays the profile text', () => {
    render(<ProfileView />);
    expect(screen.getByText('This is the profile!')).toBeTruthy();
  });
});
