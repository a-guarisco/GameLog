import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CommunityTopGamesHistogramChart from '@gamelog/common/charts/community-top-games-histogram/CommunityTopGamesHistogramChart';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  __esModule: true,
  default: {
    getCommunityWeeklyTopGames: jest.fn(),
    getCommunityMonthlyTopGames: jest.fn(),
    getGameBasicInfo: jest.fn(),
  },
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, isLoading, error, ErrorBehaviour, testID, headerRight }: any) => {
      if (error) return <ErrorBehaviour />;
      return (
        <View testID={testID}>
          {headerRight}
          {!isLoading && children({ cardWidth: 350, theme: { '--color-typography-200': '0,0,0' } })}
        </View>
      );
    },
  };
});

const mockUseOrientation = jest.fn(() => ({ isLandscape: false }));
jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: () => mockUseOrientation(),
}));

describe('CommunityTopGamesHistogramChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrientation.mockReturnValue({ isLandscape: false });
  });

  it('renders top games chart items and legend with data', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([
      { id: '1245620', user_playtime: 14.333, community_playtime: 8.75 },
      { id: '730', user_playtime: 5.0, community_playtime: 0 },
    ]);
    (ApiManager.getGameBasicInfo as jest.Mock).mockImplementation((appId) => {
      if (appId === '1245620') {
        return Promise.resolve({ '1245620': { data: { name: 'Elden Ring' } } });
      }
      return Promise.resolve({ '730': { data: { name: 'Counter-Strike 2' } } });
    });

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByTestId('community-top-games-histogram-chart')).toBeTruthy();
      expect(screen.getByTestId('top-game-item-1245620')).toBeTruthy();
      expect(screen.getByTestId('game-capsule-1245620')).toBeTruthy();
      expect(screen.getByText('Elden Ring')).toBeTruthy();
      expect(screen.getByText('14h 20m')).toBeTruthy();
      expect(screen.getByText('8h 45m')).toBeTruthy();
      expect(screen.getAllByText('You').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Others').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('slices top 5 games in portrait mode even if backend returns more', async () => {
    const mockGames = Array.from({ length: 8 }, (_, i) => ({
      id: `app_${i}`,
      user_playtime: 10 - i,
      community_playtime: 5,
    }));
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue(mockGames);
    (ApiManager.getGameBasicInfo as jest.Mock).mockImplementation((appId) =>
      Promise.resolve({ [appId]: { data: { name: `Game ${appId}` } } })
    );

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByTestId('top-game-item-app_0')).toBeTruthy();
      expect(screen.getByTestId('top-game-item-app_4')).toBeTruthy();
      expect(screen.queryByTestId('top-game-item-app_5')).toBeNull();
    });
  });

  it('slices up to 10 games in landscape mode', async () => {
    mockUseOrientation.mockReturnValue({ isLandscape: true });
    const mockGames = Array.from({ length: 12 }, (_, i) => ({
      id: `app_${i}`,
      user_playtime: 15 - i,
      community_playtime: 6,
    }));
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue(mockGames);
    (ApiManager.getGameBasicInfo as jest.Mock).mockImplementation((appId) =>
      Promise.resolve({ [appId]: { data: { name: `Game ${appId}` } } })
    );

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByTestId('top-game-item-app_0')).toBeTruthy();
      expect(screen.getByTestId('top-game-item-app_9')).toBeTruthy();
      expect(screen.queryByTestId('top-game-item-app_10')).toBeNull();
    });
  });

  it('switches between 1W and 6M range options', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([
      { id: '1245620', user_playtime: 10, community_playtime: 5 },
    ]);
    (ApiManager.getCommunityMonthlyTopGames as jest.Mock).mockResolvedValue([
      { id: '730', user_playtime: 20, community_playtime: 10 },
    ]);

    render(<CommunityTopGamesHistogramChart scope="global" />);

    fireEvent.press(screen.getByText('6M'));

    await waitFor(() => {
      expect(ApiManager.getCommunityMonthlyTopGames).toHaveBeenCalled();
    });
  });

  it('navigates with previous/next chevrons', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([
      { id: '1245620', user_playtime: 10, community_playtime: 5 },
    ]);

    render(<CommunityTopGamesHistogramChart scope="global" />);

    const prevBtn = await waitFor(() => screen.getByTestId('community-top-games-prev'));
    fireEvent.press(prevBtn);

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyTopGames).toHaveBeenCalledTimes(2);
    });
  });

  it('renders warning error box when request fails with 400 error', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockRejectedValue(
      new Error('User region is not set')
    );

    render(<CommunityTopGamesHistogramChart scope="region" />);

    await waitFor(() => {
      expect(screen.getByText('User region is not set')).toBeTruthy();
    });
  });

  it('switches between Others and You reference options and re-orders bars', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([
      { id: '1245620', user_playtime: 14.333, community_playtime: 8.75 },
    ]);
    (ApiManager.getGameBasicInfo as jest.Mock).mockResolvedValue({
      '1245620': { data: { name: 'Elden Ring' } },
    });

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyTopGames).toHaveBeenCalledWith(
        'global',
        expect.any(String),
        expect.any(String),
        'community'
      );
      expect(screen.getByTestId('community-bar-1245620')).toBeTruthy();
      expect(screen.getByTestId('user-bar-1245620')).toBeTruthy();
    });

    // Toggle to 'You' (user reference)
    fireEvent.press(screen.getByTestId('community-top-games-reference-user'));

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyTopGames).toHaveBeenCalledWith(
        'global',
        expect.any(String),
        expect.any(String),
        'user'
      );
    });
  });

  it('renders empty state when no data is returned', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([]);

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByText('No top community games found for this period')).toBeTruthy();
    });
  });
});
