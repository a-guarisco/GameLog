import { render, screen, waitFor } from '@testing-library/react-native';
import AchievementsListView from '@gamelog/game/AchievementsListView';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);
jest.mock('@gamelog/api-manager/apiManager', () => ({
  getAllPlayerAchievementsPerApp: jest.fn(),
}));

const mockRoute = {
  params: {
    gameID: 123,
    playerID: 'player1',
    achievements: {
      achievementpercentages: {
        achievements: [{ name: 'test1', percent: 50.5 }],
      },
    },
  },
};

describe('AchievementsListView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockResolvedValueOnce({});
    render(<AchievementsListView route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Achievements for')).toBeTruthy();
      expect(screen.getByText('Unknown Game')).toBeTruthy();
    });
  });

  it('displays error text when the API call fails', async () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );
    render(<AchievementsListView route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load achievements, please try again later.')).toBeTruthy();
    });
  });

  it('displays game name and achievements upon successful data fetch', async () => {
    const mockPersonalData = {
      playerstats: {
        gameName: 'game1',
        achievements: [{ apiname: 'First_Strike', achieved: 1, unlocktime: 1600000000 }],
      },
    };
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockResolvedValueOnce(
      mockPersonalData
    );
    render(<AchievementsListView route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText('Achievements for')).toBeTruthy();
      expect(screen.getByText('game1')).toBeTruthy();
    });
  });
});
