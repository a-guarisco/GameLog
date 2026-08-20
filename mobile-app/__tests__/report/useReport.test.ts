import { renderHook, act } from '@testing-library/react-native';
import { useReport } from '../../src/report/useReport';
import apiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  getDailyReport: jest.fn(),
  getGameBasicInfo: jest.fn(),
}));

describe('useReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useReport());

    expect(result.current.startDate).toBeUndefined();
    expect(result.current.endDate).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.report).toBeNull();
    expect(result.current.gameNames).toEqual({});
  });

  it('fetches report successfully without game reports', async () => {
    const mockReport = {
      date: '2023-10-10',
      game_reports: [],
    };
    (apiManager.getDailyReport as jest.Mock).mockResolvedValueOnce(mockReport);

    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-10'));
      result.current.setEndDate(new Date('2023-10-10'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(apiManager.getDailyReport).toHaveBeenCalledWith('2023-10-10', '2023-10-10');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.report).toEqual(mockReport);
    expect(result.current.gameNames).toEqual({});
    expect(apiManager.getGameBasicInfo).not.toHaveBeenCalled();
  });

  it('fetches report successfully and fetches game names', async () => {
    const mockReport = {
      date: '2023-10-10',
      game_reports: [
        { app_id: '123', today_play_time: 60, streak: 2 },
        { app_id: '456', today_play_time: 30, streak: 1 },
      ],
    };
    (apiManager.getDailyReport as jest.Mock).mockResolvedValueOnce(mockReport);

    (apiManager.getGameBasicInfo as jest.Mock).mockImplementation((appId) => {
      if (appId === '123') return Promise.resolve({ '123': { data: { name: 'Game 123' } } });
      if (appId === '456') return Promise.resolve({ '456': { data: { name: 'Game 456' } } });
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-10'));
      result.current.setEndDate(new Date('2023-10-10'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(apiManager.getDailyReport).toHaveBeenCalledWith('2023-10-10', '2023-10-10');
    expect(apiManager.getGameBasicInfo).toHaveBeenCalledTimes(2);
    expect(result.current.report).toEqual(mockReport);
    expect(result.current.gameNames).toEqual({
      '123': 'Game 123',
      '456': 'Game 456',
    });
  });

  it('handles fetch errors correctly', async () => {
    (apiManager.getDailyReport as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-10'));
      result.current.setEndDate(new Date('2023-10-10'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe('Network Error');
  });

  it('handles fetch errors without a message correctly', async () => {
    (apiManager.getDailyReport as jest.Mock).mockRejectedValueOnce({}); // No message

    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-10'));
      result.current.setEndDate(new Date('2023-10-10'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe('Failed to fetch report');
  });

  it('fetches default 14 days report if dates are missing', async () => {
    (apiManager.getDailyReport as jest.Mock).mockResolvedValueOnce({ date: 'Default Date', game_reports: [] });

    const { result } = renderHook(() => useReport());

    await act(async () => {
      await result.current.handleFetchReport();
    });

    // We can't strictly assert the exact dates sent as they are dynamically generated,
    // but we can ensure the API was called and no error was thrown.
    expect(apiManager.getDailyReport).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('formats dates correctly before fetching', async () => {
    (apiManager.getDailyReport as jest.Mock).mockResolvedValueOnce({ date: '2023-10-10', game_reports: [] });

    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-01T12:00:00Z'));
      result.current.setEndDate(new Date('2023-10-10T12:00:00Z'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(apiManager.getDailyReport).toHaveBeenCalledWith('2023-10-01', '2023-10-10');
  });

  it('throws error when start date is after end date', async () => {
    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date('2023-10-10'));
      result.current.setEndDate(new Date('2023-10-01'));
    });

    await act(async () => {
      await result.current.handleFetchReport();
    });

    expect(result.current.error).toBe('Start date must be before or equal to end date');
  });

  it('clears dates correctly', () => {
    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.setStartDate(new Date());
      result.current.setEndDate(new Date());
    });

    expect(result.current.startDate).toBeDefined();
    expect(result.current.endDate).toBeDefined();

    act(() => {
      result.current.handleClearDates();
    });

    expect(result.current.startDate).toBeUndefined();
    expect(result.current.endDate).toBeUndefined();
  });
});
