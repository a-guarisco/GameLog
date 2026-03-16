import { render, screen } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);

describe('Profile', () => {
  it('renders without crashing', () => {
    render(<ProfileView />);
  });

  it('displays the profile text', () => {
    render(<ProfileView />);
    expect(screen.getByText('This is the profile!')).toBeTruthy();
  });
});
