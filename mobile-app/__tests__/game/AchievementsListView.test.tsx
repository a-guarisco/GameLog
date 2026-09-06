import { fireEvent, render, screen, waitFor, act } from '@testing-library/react-native';
import AchievementsListView from '@gamelog/game/AchievementsListView';
import ApiManager from '@gamelog/api-manager/apiManager';
import * as OrientationHook from '@gamelog/common/useOrientation';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
}));

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);
jest.mock('@gamelog/api-manager/apiManager', () => ({
  getAllPlayerAchievementsPerApp: jest.fn(),
  getStreakByGame: jest.fn().mockResolvedValue({ streak: 0 }),
}));

const mockRoute = {
  params: {
    gameID: 123,
    playerID: 'player1',
    globalAchievements: {
      achievementpercentages: {
        achievements: [{ name: 'test1', percent: 50.5 }],
      },
    },
  },
};

describe('AchievementsListView', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });
  });

  it('renders without crashing', async () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockResolvedValueOnce({});
    render(<AchievementsListView route={mockRoute} />);

    await waitFor(
      () => {
        expect(screen.getByText(/Achievements for\s*Unknown Game/)).toBeTruthy();
      },
      { timeout: 5000 }
    );
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
      expect(screen.getByText(/Achievements for\s*game1/)).toBeTruthy();
    });
  });

  it('goes back to the game view from the floating back button', async () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockResolvedValueOnce({});
    render(<AchievementsListView route={mockRoute} />);

    fireEvent.press(await screen.findByTestId('achievements-back'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the back button on screen while the achievements are still loading', () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockReturnValueOnce(
      new Promise(() => {})
    );
    render(<AchievementsListView route={mockRoute} />);

    expect(screen.getByTestId('achievements-back')).toBeTruthy();
  });

  it('triggers pull-to-refresh and refetches achievements', async () => {
    (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mockResolvedValue({
      playerstats: {
        gameName: 'game1',
        achievements: [{ apiname: 'First_Strike', achieved: 1, unlocktime: 1600000000 }],
      },
    });

    render(<AchievementsListView route={mockRoute} />);

    await waitFor(() => {
      expect(screen.getByText(/Achievements for\s*game1/)).toBeTruthy();
    });

    const initialCalls = (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mock.calls.length;

    const scrollView = screen.getByTestId('scrollable-page-scroll');

    await act(async () => {
      fireEvent(scrollView, 'refresh');
    });

    expect(
      (ApiManager.getAllPlayerAchievementsPerApp as jest.Mock).mock.calls.length
    ).toBeGreaterThan(initialCalls);
  });

  it('navigates to Game with showAchievements: true and resolved gameItem when orientation is landscape', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: false,
      width: 844,
      height: 390,
    });

    const { toJSON } = render(<AchievementsListView route={mockRoute} />);

    expect(mockNavigate).toHaveBeenCalledWith(
      'Game',
      expect.objectContaining({
        gameItem: expect.objectContaining({ appid: 123 }),
        showAchievements: true,
      })
    );
    expect(toJSON()).toBeNull();
  });

  it('navigates to Game preserving gameItem when route params includes gameItem', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: false,
      width: 844,
      height: 390,
    });

    const routeWithGameItem = {
      params: {
        ...mockRoute.params,
        gameItem: { appid: 123, name: 'Custom Game Name' },
      },
    };

    render(<AchievementsListView route={routeWithGameItem} />);

    expect(mockNavigate).toHaveBeenCalledWith('Game', {
      gameItem: { appid: 123, name: 'Custom Game Name' },
      showAchievements: true,
    });
  });
});
