import { renderHook, act } from '@testing-library/react-hooks';
import { useGameList } from '@gamelog/game-list/useGameList';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: jest.fn(),
}));

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;

const mockGames = {
  response: {
    games: [
      { appid: 1, name: 'Portal', playtime_forever: 100 },
      { appid: 2, name: 'Half-Life', playtime_forever: 500 },
    ],
  },
};

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

  it('should sort games by name', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    const { result } = renderHook(() => useGameList('123'));

    act(() => {
      result.current.handleSortChange('name');
    });

    expect(result.current.processedGames[0].name).toBe('Half-Life');
    expect(result.current.processedGames[1].name).toBe('Portal');
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
