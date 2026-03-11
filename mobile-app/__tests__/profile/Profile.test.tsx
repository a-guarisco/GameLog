import { render, screen } from '@testing-library/react-native';
import Profile from '../../src/profile/Profile';

jest.mock(
  '../../src/common',
  () => jest.requireActual('../../src/helpers/testHelpers').commonGLMocks
);

describe('Profile', () => {
  it('renders without crashing', () => {
    render(<Profile />);
  });

  it('displays the profile text', () => {
    render(<Profile />);
    expect(screen.getByText('This is the profile!')).toBeTruthy();
  });
});
