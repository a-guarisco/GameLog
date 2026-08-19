import { renderHook, act } from '@testing-library/react-native';
import { useReportSortOrder } from '../../src/report/useReportSortOrder';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('useReportSortOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default value and fetches from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useReportSortOrder('playtime'));

    expect(result.current.sortOrder).toBe('playtime');
    expect(result.current.isLoaded).toBe(false);

    // Wait for the useEffect to finish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@report_sort_order');
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.sortOrder).toBe('playtime');
  });

  it('loads saved sort order from AsyncStorage if valid', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('streak');

    const { result } = renderHook(() => useReportSortOrder('playtime'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.sortOrder).toBe('streak');
    expect(result.current.isLoaded).toBe(true);
  });

  it('ignores invalid saved sort order from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid_sort');

    const { result } = renderHook(() => useReportSortOrder('playtime'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.sortOrder).toBe('playtime');
  });

  it('handles AsyncStorage errors gracefully on load', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Async error'));

    const { result } = renderHook(() => useReportSortOrder('playtime'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load sort order', expect.any(Error));
    expect(result.current.sortOrder).toBe('playtime');
    expect(result.current.isLoaded).toBe(true);
    
    consoleSpy.mockRestore();
  });

  it('saves new sort order to AsyncStorage', async () => {
    const { result } = renderHook(() => useReportSortOrder('playtime'));

    await act(async () => {
      await result.current.setSortOrder('alpha');
    });

    expect(result.current.sortOrder).toBe('alpha');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@report_sort_order', 'alpha');
  });

  it('handles AsyncStorage errors gracefully on save', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Async error'));

    const { result } = renderHook(() => useReportSortOrder('playtime'));

    await act(async () => {
      await result.current.setSortOrder('alpha');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save sort order', expect.any(Error));
    expect(result.current.sortOrder).toBe('alpha'); // State still updates even if storage fails
    
    consoleSpy.mockRestore();
  });
});
