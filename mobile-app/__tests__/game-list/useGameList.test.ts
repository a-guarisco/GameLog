import { renderHook, act } from '@testing-library/react-hooks';
import { useGameList } from '@gamelog/game-list/useGameList';
import {
  useGetOwnedGames,
  useGetFullPlaytimeReport,
  useGetGenresBatch,
  useGetUserGameStatuses,
} from '@gamelog/api-manager/useApi';
import { getSteamApiKey } from '@gamelog/api-manager/steamApiKey';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: jest.fn(),
  useGetFullPlaytimeReport: jest.fn(),
  useGetGenresBatch: jest.fn(),
  useGetUserGameStatuses: jest.fn(),
}));

jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamApiKey: jest.fn(() => 'mock-api-key'),
}));

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;
const mockUseGetFullPlaytimeReport = useGetFullPlaytimeReport as jest.Mock;
const mockUseGetGenresBatch = useGetGenresBatch as jest.Mock;
const mockUseGetUserGameStatuses = useGetUserGameStatuses as jest.Mock;

const mockGames = {
  response: {
    games: [
      { appid: 1, name: 'Portal', playtime_forever: 100 },
      { appid: 2, name: 'Half-Life', playtime_forever: 500 },
    ],
  },
};

const mockRefetchOwnedGames = jest.fn().mockResolvedValue(undefined);
const mockRefetchPlaytimeReport = jest.fn().mockResolvedValue(undefined);
const mockRefetchLibraryGenres = jest.fn().mockResolvedValue(undefined);
const mockRefetchUserGameStatuses = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGetFullPlaytimeReport.mockReturnValue({
    playtimeReport: null,
    isLoadingPlaytimeReport: false,
    refetchPlaytimeReport: mockRefetchPlaytimeReport,
  });
  mockUseGetGenresBatch.mockReturnValue({
    libraryGenres: new Map(),
    isLoadingLibraryGenres: false,
    refetchLibraryGenres: mockRefetchLibraryGenres,
  });
  mockUseGetUserGameStatuses.mockReturnValue({
    userGameStatuses: {},
    isLoadingUserGameStatuses: false,
    refetchUserGameStatuses: mockRefetchUserGameStatuses,
  });
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

  it('should map gameStatus from userGameStatuses', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });
    mockUseGetUserGameStatuses.mockReturnValue({
      userGameStatuses: { '1': 'playing', '2': 'platinato' },
      isLoadingUserGameStatuses: false,
    });

    const { result } = renderHook(() => useGameList('123'));
    // Half-Life (appid 2, playtime 500) is sorted first, Portal (appid 1, playtime 100) is second
    expect(result.current.processedGames[0].gameStatus).toBe('platinato');
    expect(result.current.processedGames[1].gameStatus).toBe('playing');
  });

  it('should filter games based on statusFilter', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });
    mockUseGetUserGameStatuses.mockReturnValue({
      userGameStatuses: { '1': 'playing' },
      isLoadingUserGameStatuses: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.setStatusFilter('playing');
    });
    expect(result.current.processedGames).toHaveLength(1);
    expect(result.current.processedGames[0].appid).toBe(1);

    act(() => {
      result.current.setStatusFilter('none');
    });
    expect(result.current.processedGames).toHaveLength(1);
    expect(result.current.processedGames[0].appid).toBe(2);

    act(() => {
      result.current.setStatusFilter('All');
    });
    expect(result.current.processedGames).toHaveLength(2);
  });

  it('calls all refetch methods when refetchAll is triggered', async () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
      refetchOwnedGames: mockRefetchOwnedGames,
    });
    mockUseGetFullPlaytimeReport.mockReturnValue({
      playtimeReport: null,
      isLoadingPlaytimeReport: false,
      refetchPlaytimeReport: mockRefetchPlaytimeReport,
    });
    mockUseGetGenresBatch.mockReturnValue({
      libraryGenres: new Map(),
      isLoadingLibraryGenres: false,
      refetchLibraryGenres: mockRefetchLibraryGenres,
    });
    mockUseGetUserGameStatuses.mockReturnValue({
      userGameStatuses: {},
      isLoadingUserGameStatuses: false,
      refetchUserGameStatuses: mockRefetchUserGameStatuses,
    });

    const { result } = renderHook(() => useGameList('123'));

    await act(async () => {
      await result.current.refetchAll();
    });

    expect(mockRefetchOwnedGames).toHaveBeenCalledTimes(1);
    expect(mockRefetchPlaytimeReport).toHaveBeenCalledTimes(1);
    expect(mockRefetchLibraryGenres).toHaveBeenCalledTimes(1);
    expect(mockRefetchUserGameStatuses).toHaveBeenCalledTimes(1);
  });

  it('keeps stable appIds passed to useGetGenresBatch when ownedGames reference changes but games are identical', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games: [{ appid: 1, name: 'Game 1' }] } },
      isLoadingOwnedGames: false,
    });

    const { rerender } = renderHook(() => useGameList('123'));
    const firstCallAppIds = mockUseGetGenresBatch.mock.calls[0][0];

    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games: [{ appid: 1, name: 'Game 1' }] } },
      isLoadingOwnedGames: false,
    });
    rerender();

    const secondCallAppIds = mockUseGetGenresBatch.mock.calls[1][0];
    expect(firstCallAppIds).toBe(secondCallAppIds);
  });

  it('maps 401 error to gamelist/steam-api-key-missing when steam API key is missing', () => {
    (getSteamApiKey as jest.Mock).mockReturnValueOnce('');

    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: true,
      errorMessageOwnedGames: 'HTTP error: 401. url Called: https://api.steampowered.com/...',
    });

    const { result } = renderHook(() => useGameList('123'));
    expect(result.current.error).toBe(true);
    expect(result.current.errorCode).toBe('gamelist/steam-api-key-missing');
    expect(result.current.errorMessage).toBe(
      'Steam API key is not configured. Please add your Steam Web API Key in your profile settings.'
    );
    expect(result.current.errorMessage).not.toContain('url Called');
  });

  it('maps 401 error to gamelist/unauthorized when steam API key is present', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: true,
      errorMessageOwnedGames: 'HTTP error: 401. url Called: https://api.steampowered.com/...',
    });

    const { result } = renderHook(() => useGameList('123'));
    expect(result.current.error).toBe(true);
    expect(result.current.errorCode).toBe('gamelist/unauthorized');
    expect(result.current.errorMessage).toBe(
      'Unable to access Steam library. Your Steam API key may be invalid or unauthorized.'
    );
    expect(result.current.errorMessage).not.toContain('url Called');
  });
});
