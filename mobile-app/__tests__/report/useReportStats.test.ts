import { renderHook } from '@testing-library/react-native';
import { useReportStats } from '../../src/report/useReportStats';
import type { DailyReport } from '@gamelog/api-manager/dto/report';

describe('useReportStats', () => {
  const mockReport: DailyReport = {
    date: '2023-10-10',
    game_reports: [
      { app_id: '1', today_play_time: 120, streak: 5 },
      { app_id: '2', today_play_time: 60, streak: 10 },
      { app_id: '3', today_play_time: 30, streak: 1 },
    ],
  };

  const gameNames = {
    '1': 'Zelda',
    '2': 'Mario',
  };

  it('returns null summaryStats if report is missing', () => {
    const { result } = renderHook(() =>
      useReportStats(null, new Date(), new Date(), 'playtime', gameNames)
    );
    expect(result.current.summary).toBeNull();
  });

  it('returns null summaryStats if appliedStartDate is missing', () => {
    const { result } = renderHook(() =>
      useReportStats(mockReport, undefined, new Date(), 'playtime', gameNames)
    );
    expect(result.current.summary).toBeNull();
  });

  it('calculates stats correctly', () => {
    const start = new Date('2023-10-01T00:00:00Z');
    const end = new Date('2023-10-10T00:00:00Z');

    const { result } = renderHook(() =>
      useReportStats(mockReport, start, end, 'playtime', gameNames)
    );

    expect(result.current.summary).toEqual({
      stats: [
        { value: '3h', label: 'Playtime' },
        { value: '3', label: 'Games' },
        { value: 'Zelda', label: 'Top Game' },
      ],
      rangeText: expect.stringMatching(/ — .* · 10 days/),
      maxPlaytimePerDay: 0,
      totalGames: 3,
      totalPlaytime: 210,
      topGameName: 'Zelda'
    });
  });

  it('calculates diffDays correctly and falls back to new Date() if appliedEndDate is undefined', () => {
    const end = new Date('2023-10-10T12:00:00Z');
    jest.useFakeTimers().setSystemTime(end);

    const start = new Date(end);
    start.setDate(start.getDate() - 5);

    const { result } = renderHook(() =>
      useReportStats(mockReport, start, undefined, 'playtime', gameNames)
    );

    expect(result.current.summary).toBeDefined();
    expect(result.current.summary?.rangeText).toMatch(/ · 6 days/); // 5 days difference + 1 inclusive

    jest.useRealTimers();
  });

  it('sorts by playtime', () => {
    const { result } = renderHook(() =>
      useReportStats(mockReport, new Date(), new Date(), 'playtime', gameNames)
    );

    expect(result.current.sortedGameReports[0].app_id).toBe('1');
    expect(result.current.sortedGameReports[1].app_id).toBe('2');
    expect(result.current.sortedGameReports[2].app_id).toBe('3');
  });

  it('sorts by streak', () => {
    const { result } = renderHook(() =>
      useReportStats(mockReport, new Date(), new Date(), 'streak', gameNames)
    );

    expect(result.current.sortedGameReports[0].app_id).toBe('2');
    expect(result.current.sortedGameReports[1].app_id).toBe('1');
    expect(result.current.sortedGameReports[2].app_id).toBe('3');
  });

  it('sorts by alpha with fallback for missing names', () => {
    const mockReportWithNoNames: DailyReport = {
      date: '2023-10-10',
      game_reports: [
        { app_id: '1', today_play_time: 10, streak: 1 },
        { app_id: '4', today_play_time: 20, streak: 2 },
        { app_id: '5', today_play_time: 30, streak: 3 },
      ],
    };

    const { result } = renderHook(() =>
      useReportStats(mockReportWithNoNames, new Date(), new Date(), 'alpha', gameNames)
    );

    // Alpha order: 'App ID: 4' (A), 'App ID: 5' (A), 'Zelda' (Z)
    expect(result.current.sortedGameReports[0].app_id).toBe('4');
    expect(result.current.sortedGameReports[1].app_id).toBe('5');
    expect(result.current.sortedGameReports[2].app_id).toBe('1');
  });

  it('formatDate formats correctly and falls back if undefined', () => {
    const { result } = renderHook(() =>
      useReportStats(null, undefined, undefined, 'playtime', gameNames)
    );

    const date = new Date('2023-10-10T12:00:00Z');
    expect(result.current.formatDate(date)).toBe(date.toLocaleDateString());
    expect(result.current.formatDate(undefined)).toBe('Select Date');
  });
});
