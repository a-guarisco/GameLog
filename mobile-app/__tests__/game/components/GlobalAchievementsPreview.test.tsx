import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GlobalAchievementsPreview from '@gamelog/components/game-view/GlobalAchievementsPreview';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useNavigation } from '@react-navigation/native';

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);
jest.mock('@gamelog/api-manager/apiManager', () => ({
  getGlobalAchievement: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('GlobalAchievementsPreview', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it('displays an error message when the API call fails', async () => {
    (ApiManager.getGlobalAchievement as jest.Mock).mockRejectedValueOnce(
      new Error('Network Error')
    );
    render(<GlobalAchievementsPreview gameID={123} playerID="player1" />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load global achievements, please try again later.')
      ).toBeTruthy();
    });
  });

  it('renders a maximum of 3 achievements and correctly display global-progress-bar', async () => {
    const mockData = {
      achievementpercentages: {
        achievements: [
          { name: 'Ach 1', percent: 10 },
          { name: 'Ach 2', percent: 20 },
          { name: 'Ach 3', percent: 30 },
          { name: 'Ach 4', percent: 40 },
        ],
      },
    };
    (ApiManager.getGlobalAchievement as jest.Mock).mockResolvedValueOnce(mockData);

    render(<GlobalAchievementsPreview gameID={123} playerID="player1" />);

    await waitFor(() => {
      expect(screen.getByText('Ach 1')).toBeTruthy();
      expect(screen.getByText('Ach 2')).toBeTruthy();
      expect(screen.getByText('Ach 3')).toBeTruthy();
      expect(screen.queryByText('Ach 4')).toBeNull();
    });

    const progressBars = screen.getAllByTestId('global-progress-bar');

    expect(progressBars[0].props.style).toEqual(expect.objectContaining({ width: '10%' }));
    expect(progressBars[1].props.style).toEqual(expect.objectContaining({ width: '20%' }));
    expect(progressBars[2].props.style).toEqual(expect.objectContaining({ width: '30%' }));
  });

  it('navigates to AchievementsList when "See More" is pressed', async () => {
    const mockData = {
      achievementpercentages: {
        achievements: [{ name: 'Ach 1', percent: 10 }],
      },
    };
    (ApiManager.getGlobalAchievement as jest.Mock).mockResolvedValueOnce(mockData);

    render(<GlobalAchievementsPreview gameID={123} playerID="player1" />);

    await waitFor(() => {
      expect(screen.getByText('See More')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('See More'));

    expect(mockNavigate).toHaveBeenCalledWith('AchievementsList', {
      achievements: mockData,
      gameID: 123,
      playerID: 'player1',
    });
  });
});
