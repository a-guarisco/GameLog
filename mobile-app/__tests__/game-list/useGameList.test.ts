import { renderHook, act } from '@testing-library/react-hooks';
import { useGameList } from '@gamelog/game-list/useGameList';
import { useGetOwnedGames, useGetFullPlaytimeReport, useGetGenresBatch } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: jest.fn(),
  useGetFullPlaytimeReport: jest.fn(),
  useGetGenresBatch: jest.fn(),
}));

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;
const mockUseGetFullPlaytimeReport = useGetFullPlaytimeReport as jest.Mock;
const mockUseGetGenresBatch = useGetGenresBatch as jest.Mock;

const mockGames = {
  response: {
    games: [
      { appid: 1, name: 'Portal', playtime_forever: 100 },
      { appid: 2, name: 'Half-Life', playtime_forever: 500 },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetFullPlaytimeReport.mockReturnValue({ playtimeReport: null, isLoadingPlaytimeReport: false });
  mockUseGetGenresBatch.mockReturnValue({ libraryGenres: new Map(), isLoadingLibraryGenres: false });
});

describe('useGameList hook', () => {
  it('should filter games based on search query', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.setSearchQuery('Portal');
    });

    expect(result.current.processedGames).toHaveLength(1);
    expect(result.current.processedGames[0].name).toBe('Portal');
  });

  it('should correctly handle the isEmpty state', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games: [] } },
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));
    expect(result.current.isEmpty).toBe(true);
  });

  it('should sort games by max_per_day', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: {
        response: {
          games: [
            { appid: 1, name: 'Game A', playtime_forever: 100 },
            { appid: 2, name: 'Game B', playtime_forever: 500 },
          ],
        },
      },
      isLoadingOwnedGames: false,
    });

    mockUseGetFullPlaytimeReport.mockReturnValue({
      playtimeReport: {
        game_reports: [
          { app_id: '1', max_playtime_per_day: 50 },
          { app_id: '2', max_playtime_per_day: 150 },
        ],
      },
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.handleSortChange('max_per_day');
    });

    // Descending order expected
    expect(result.current.processedGames[0].name).toBe('Game B');
    expect(result.current.processedGames[1].name).toBe('Game A');
  });

  it('should sort games by playtime', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.handleSortChange('playtime');
    });

    expect(result.current.processedGames[0].playtime_forever).toBe(500);
    expect(result.current.processedGames[1].playtime_forever).toBe(100);
  });

  it('should set isLoading to true when sorting', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.handleSortChange('name');
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should set isLoading to false after sorting', () => {
    jest.useFakeTimers();
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.handleSortChange('name');
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should return noResults as true when search yields no games', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.setSearchQuery('NonExistentGame');
    });

    expect(result.current.noResults).toBe(true);
  });

  it('should return empty processedGames when response is null', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));
    expect(result.current.processedGames).toEqual([]);
  });
});
