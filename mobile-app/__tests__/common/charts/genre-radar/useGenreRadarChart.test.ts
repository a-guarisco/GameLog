import { renderHook, waitFor } from '@testing-library/react-native';
import { useGenreRadarChart } from '@gamelog/common/charts/genre-radar/useGenreRadarChart';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';

jest.mock('@gamelog/common/charts/genre-radar/buildGenreChartData', () => ({
  buildGenreChartData: jest.fn(),
}));

describe('useGenreRadarChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty data when ownedGames is null or undefined', async () => {
    const { result } = renderHook(() => useGenreRadarChart(null));
    expect(result.current.values).toEqual([]);
    expect(result.current.labels).toEqual([]);
    expect(result.current.isLoadingGenres).toBe(false);
  });

  it('fetches and maps genre data correctly', async () => {
    const mockData = [
      { label: 'Action', value: 120 },
      { label: 'RPG', value: 60 },
    ];
    (buildGenreChartData as jest.Mock).mockResolvedValueOnce(mockData);

    const ownedGames: any = { response: { games: [{ appid: '1' }] } };
    const { result } = renderHook(() => useGenreRadarChart(ownedGames));

    expect(result.current.isLoadingGenres).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingGenres).toBe(false);
    });

    expect(result.current.values).toEqual([120, 60]);
    expect(result.current.labels).toEqual(['Action\n2h 0m', 'RPG\n1h 0m']);
  });

  it('handles fetch errors gracefully', async () => {
    (buildGenreChartData as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const ownedGames: any = { response: { games: [{ appid: '1' }] } };
    const { result } = renderHook(() => useGenreRadarChart(ownedGames));

    expect(result.current.isLoadingGenres).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingGenres).toBe(false);
    });

    expect(result.current.values).toEqual([]);
    expect(result.current.labels).toEqual([]);
  });
});
