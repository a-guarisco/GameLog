import { render, screen } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';

describe('Profile', () => {
  it('renders without crashing', () => {
    render(<ProfileView />);
  });

  it('displays the profile text', () => {
    render(<ProfileView />);
    expect(screen.getByText('This is the profile!')).toBeTruthy();
  });
});
