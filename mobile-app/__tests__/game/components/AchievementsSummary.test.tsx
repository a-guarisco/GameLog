import { fireEvent, render, screen } from '@testing-library/react-native';
import AchievementsSummary from '@gamelog/game/AchievementsSummary';

describe('AchievementsSummary', () => {
  it('renders unlocked count, total count, and completion percentage', () => {
    const onPress = jest.fn();
    render(
      <AchievementsSummary
        unlockedCount={15}
        totalCount={30}
        completionPercent={50}
        onPress={onPress}
      />
    );

    expect(screen.getByText('Achievements')).toBeTruthy();
    expect(screen.getByText('15 / 30 · 50%')).toBeTruthy();
  });

  it('triggers onPress when summary is tapped', () => {
    const onPress = jest.fn();
    render(
      <AchievementsSummary
        unlockedCount={15}
        totalCount={30}
        completionPercent={50}
        onPress={onPress}
      />
    );

    fireEvent.press(screen.getByTestId('achievements-summary'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
