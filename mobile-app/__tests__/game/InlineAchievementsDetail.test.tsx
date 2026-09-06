import { fireEvent, render, screen } from '@testing-library/react-native';
import InlineAchievementsDetail from '@gamelog/game/InlineAchievementsDetail';
import useAchievementsData from '@gamelog/game/useAchievementsData';

jest.mock('@gamelog/game/useAchievementsData');

const mockUseAchievementsData = useAchievementsData as jest.Mock;

describe('InlineAchievementsDetail', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAchievementsData.mockReturnValue({
      mergedAchievements: [
        {
          name: 'ACH_1',
          displayName: 'First Achievement',
          percent: 75.5,
          unlockTime: 1620000000,
          description: 'Unlocked something',
        },
      ],
      unlockedCount: 1,
      totalCount: 2,
      completionPercent: 50,
      gameName: 'Test Game',
      isLoading: false,
      error: null,
    });
  });

  it('renders progress bar and achievements list', () => {
    render(
      <InlineAchievementsDetail
        gameID="123"
        playerID="player1"
        globalAchievements={null}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('All Achievements')).toBeTruthy();
    expect(screen.getByText('Back to Tabs')).toBeTruthy();
    expect(screen.getByText('First Achievement')).toBeTruthy();
  });

  it('calls onBack when Back to Tabs is pressed', () => {
    render(
      <InlineAchievementsDetail
        gameID="123"
        playerID="player1"
        globalAchievements={null}
        onBack={mockOnBack}
      />
    );

    fireEvent.press(screen.getByTestId('back-to-tabs'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders loading state', () => {
    mockUseAchievementsData.mockReturnValue({
      mergedAchievements: [],
      unlockedCount: 0,
      totalCount: 0,
      completionPercent: 0,
      gameName: 'Test Game',
      isLoading: true,
      error: null,
    });

    render(
      <InlineAchievementsDetail
        gameID="123"
        playerID="player1"
        globalAchievements={null}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Loading achievements...')).toBeTruthy();
  });

  it('renders error state', () => {
    mockUseAchievementsData.mockReturnValue({
      mergedAchievements: [],
      unlockedCount: 0,
      totalCount: 0,
      completionPercent: 0,
      gameName: 'Test Game',
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(
      <InlineAchievementsDetail
        gameID="123"
        playerID="player1"
        globalAchievements={null}
        onBack={mockOnBack}
      />
    );

    expect(
      screen.getByText('Failed to load achievements, please try again later.')
    ).toBeTruthy();
  });

  it('renders info box when no achievements are found', () => {
    mockUseAchievementsData.mockReturnValue({
      mergedAchievements: [],
      unlockedCount: 0,
      totalCount: 0,
      completionPercent: 0,
      gameName: 'Test Game',
      isLoading: false,
      error: null,
    });

    render(
      <InlineAchievementsDetail
        gameID="123"
        playerID="player1"
        globalAchievements={null}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('No achievements found for this game.')).toBeTruthy();
  });
});
