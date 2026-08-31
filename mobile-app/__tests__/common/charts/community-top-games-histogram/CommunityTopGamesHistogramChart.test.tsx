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

describe('CommunityTopGamesHistogramChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(screen.getByText('You')).toBeTruthy();
      expect(screen.getByText('Others')).toBeTruthy();
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

  it('renders empty state when no data is returned', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValue([]);

    render(<CommunityTopGamesHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByText('No top community games found for this period')).toBeTruthy();
    });
  });
});
