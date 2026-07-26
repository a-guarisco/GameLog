import { render, screen } from '@testing-library/react-native';
import AchievementItem from '@gamelog/game/AchievementItem';

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);

describe('AchievementItem', () => {
  it('render without crash', () => {
    render(<AchievementItem name="test" percentage={50.5} />);
    expect(screen.getByText('test')).toBeTruthy();
    expect(screen.getByText('50.5%')).toBeTruthy();
  });

  it('timestamp is display correctly when achievement is unlocked', () => {
    const timestamp = 1600000000;
    render(<AchievementItem name="test" percentage={100} unlockTime={timestamp} />);
    const expectedDate = new Date(timestamp * 1000).toLocaleDateString();
    expect(screen.getByText(`Achievement unlocked on: ${expectedDate}`)).toBeTruthy();
  });

  it('should not display unlock time when achievement is locked', () => {
    render(<AchievementItem name="test" percentage={100} />);
    expect(screen.queryByText(/Achievement unlocked on:/)).toBeNull();
  });

  it('global-progress-bar length is proportional to the percentage of achievement unlocked', async () => {
    const testPercentage = 75;
    render(<AchievementItem name="test" percentage={testPercentage} />);
    const progressBar = screen.getByTestId('global-progress-bar');
    expect(progressBar.props.style).toEqual(
      expect.objectContaining({ width: `${testPercentage}%` })
    );
  });

  it('renders displayName and description when provided', () => {
    render(
      <AchievementItem
        name="PLAY_CS2"
        displayName="A New Beginning"
        percentage={80}
      />
    );
    expect(screen.getByText('A New Beginning')).toBeTruthy();
  });
});
