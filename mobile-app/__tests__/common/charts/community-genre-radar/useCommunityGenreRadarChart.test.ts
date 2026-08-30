import { renderHook, waitFor } from '@testing-library/react-native';
import { useCommunityGenreRadarChart } from '@gamelog/common/charts/community-genre-radar/useCommunityGenreRadarChart';
import { useCommunityGenre } from '@gamelog/common/charts/community-genre-radar/useCommunityGenre';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';

jest.mock('@gamelog/common/charts/community-genre-radar/useCommunityGenre');
jest.mock('@gamelog/common/charts/genre-radar/buildGenreChartData');

describe('useCommunityGenreRadarChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes percentage comparison between user and community datasets', async () => {
    (useCommunityGenre as jest.Mock).mockReturnValue({
      communityGenres: [
        { id: '1', description: 'Action', percentage: 40 },
        { id: '2', description: 'RPG', percentage: 30 },
        { id: '3', description: 'Strategy', percentage: 20 },
      ],
      isLoadingCommunity: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    // User played Action (100 min) and RPG (100 min) -> 50% Action, 50% RPG, 0% Strategy
    (buildGenreChartData as jest.Mock).mockResolvedValueOnce([
      { label: 'Action', value: 100, color: '#111' },
      { label: 'RPG', value: 100, color: '#222' },
    ]);

    const ownedGames: any = { response: { games: [{ appid: '10' }] } };
    const { result } = renderHook(() => useCommunityGenreRadarChart(ownedGames, 'global'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userValues).toEqual([50, 50, 0]);
    expect(result.current.communityValues).toEqual([40, 30, 20]);
    expect(result.current.dataSet).toEqual([
      [50, 50, 0],
      [40, 30, 20],
    ]);
    expect(result.current.labels).toEqual([
      'Action\n50% · 40%',
      'RPG\n50% · 30%',
      'Strategy\n0% · 20%',
    ]);
    expect(result.current.maxValue).toBe(50);
  });

  it('returns empty dataset when community data is empty', async () => {
    (useCommunityGenre as jest.Mock).mockReturnValue({
      communityGenres: [],
      isLoadingCommunity: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    (buildGenreChartData as jest.Mock).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCommunityGenreRadarChart(null, 'global'));

    expect(result.current.dataSet).toEqual([]);
    expect(result.current.labels).toEqual([]);
    expect(result.current.maxValue).toBe(1);
  });

  it('handles error from community hook gracefully', async () => {
    (useCommunityGenre as jest.Mock).mockReturnValue({
      communityGenres: [],
      isLoadingCommunity: false,
      errorCommunity: true,
      errorMessageCommunity: 'User has no friends',
    });

    const { result } = renderHook(() => useCommunityGenreRadarChart(null, 'friends'));

    expect(result.current.errorCommunity).toBe(true);
    expect(result.current.errorMessageCommunity).toBe('User has no friends');
  });
});
