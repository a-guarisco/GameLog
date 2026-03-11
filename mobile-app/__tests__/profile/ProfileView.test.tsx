import { render, screen } from '@testing-library/react-native';
import ProfileView from '../../src/profile/ProfileView';

jest.mock(
  '../../src/common',
  () => jest.requireActual('../../src/helpers/testHelpers').commonGLMocks
);

describe('Profile', () => {
  it('renders without crashing', () => {
    render(<ProfileView />);
  });

  it('displays the profile text', () => {
    render(<ProfileView />);
    expect(screen.getByText('This is the profile!')).toBeTruthy();
  });
});
