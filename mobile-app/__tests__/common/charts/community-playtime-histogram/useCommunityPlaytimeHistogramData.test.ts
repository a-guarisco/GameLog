import { renderHook } from '@testing-library/react-native';
import { useCommunityPlaytimeHistogramData } from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytimeHistogramData';
import {
  WEEKDAY_LABELS,
  FIRST_HALF_MONTH_LABELS,
  FULL_YEAR_MONTH_LABELS,
} from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytime';

describe('useCommunityPlaytimeHistogramData', () => {
  const theme = {
    '--color-typography-200': '100,100,100',
    '--color-typography-400': '150,150,150',
    '--color-typography-600': '200,200,200',
    '--color-primary-500': '0,100,200',
  };

  const mockData = {
    user: [1.5, 2.0, 0, 3.5, 1.0, 4.0, 0],
    community: [2.0, 1.5, 1.0, 2.5, 2.0, 3.0, 1.5],
  };

  it('calculates totals and labels correctly for week mode', () => {
    const { result } = renderHook(() =>
      useCommunityPlaytimeHistogramData({
        data: mockData,
        periodRange: 'week',
        labels: WEEKDAY_LABELS,
        offset: 0,
        axisColor: 'rgb(100,100,100)',
        primaryColor: 'rgb(0,100,200)',
        purpleColor: 'rgb(168,85,247)',
        theme,
        barWidth: 12,
        currentDate: new Date('2026-08-30T12:00:00Z'),
      })
    );

    expect(result.current.userTotalHours).toBe(12); // 1.5+2+0+3.5+1+4+0 = 12
    expect(result.current.communityTotalHours).toBe(13.5); // 2+1.5+1+2.5+2+3+1.5 = 13.5
    expect(result.current.userTotalLabel).toBe('12h 0m');
    expect(result.current.communityTotalLabel).toBe('13h 30m');
    expect(result.current.maxVisibleHours).toBe(4);
    expect(result.current.hasPlaytime).toBe(true);
    expect(result.current.barData.length).toBe(14); // 7 days * 2 bars per day
  });

  it('calculates data for months mode', () => {
    const monthData = {
      user: [10.5, 15.0, 8.0, 20.0, 12.0, 5.0],
      community: [12.0, 14.0, 10.0, 18.0, 15.0, 8.0],
    };

    const { result } = renderHook(() =>
      useCommunityPlaytimeHistogramData({
        data: monthData,
        periodRange: 'month',
        labels: FIRST_HALF_MONTH_LABELS,
        offset: 0,
        axisColor: 'rgb(100,100,100)',
        primaryColor: 'rgb(0,100,200)',
        purpleColor: 'rgb(168,85,247)',
        theme,
        barWidth: 12,
      })
    );

    expect(result.current.userTotalHours).toBe(70.5);
    expect(result.current.communityTotalHours).toBe(77);
    expect(result.current.maxVisibleHours).toBe(20);
    expect(result.current.barData.length).toBe(12); // 6 months * 2 bars per month
  });

  it('calculates data for year mode (12 months = 24 bars)', () => {
    const yearUserData = [10, 15, 8, 20, 12, 5, 14, 18, 22, 16, 9, 11];
    const yearCommData = [12, 14, 10, 18, 15, 8, 16, 17, 20, 14, 10, 12];
    const yearData = {
      user: yearUserData,
      community: yearCommData,
    };

    // 2026-08-30 is in August (month index 7)
    const testDate = new Date('2026-08-30T12:00:00Z');

    const { result } = renderHook(() =>
      useCommunityPlaytimeHistogramData({
        data: yearData,
        periodRange: 'year',
        labels: FULL_YEAR_MONTH_LABELS,
        offset: 0,
        axisColor: 'rgb(100,100,100)',
        primaryColor: 'rgb(0,100,200)',
        purpleColor: 'rgb(168,85,247)',
        theme,
        barWidth: 14,
        currentDate: testDate,
      })
    );

    expect(result.current.userTotalHours).toBe(160);
    expect(result.current.communityTotalHours).toBe(166);
    expect(result.current.maxVisibleHours).toBe(22);
    expect(result.current.barData.length).toBe(24); // 12 months * 2 bars
    // August is at index 7 (pair starts at barData[14])
    expect(result.current.barData[14].label).toBe('Aug');
  });

  it('calculates data for twoWeeks mode (14 days = 28 bars)', () => {
    const twoWeeksUser = [1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8];
    const twoWeeksComm = [2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3];
    const twoWeeksData = {
      user: twoWeeksUser,
      community: twoWeeksComm,
    };
    const labels = [...WEEKDAY_LABELS, ...WEEKDAY_LABELS];

    // 2026-08-30 is Sunday (day index 6 of week 2 -> index 13)
    const testDate = new Date('2026-08-30T12:00:00Z');

    const { result } = renderHook(() =>
      useCommunityPlaytimeHistogramData({
        data: twoWeeksData,
        periodRange: 'twoWeeks',
        labels,
        offset: 0,
        axisColor: 'rgb(100,100,100)',
        primaryColor: 'rgb(0,100,200)',
        purpleColor: 'rgb(168,85,247)',
        theme,
        barWidth: 14,
        currentDate: testDate,
      })
    );

    expect(result.current.userTotalHours).toBe(63); // 28 + 35 = 63
    expect(result.current.communityTotalHours).toBe(35); // 14 + 21 = 35
    expect(result.current.maxVisibleHours).toBe(8);
    expect(result.current.barData.length).toBe(28); // 14 days * 2 bars
    // Last pair (Sunday of 2nd week) starts at index 26
    expect(result.current.barData[26].label).toBe('Su');
  });

  it('handles null/empty data gracefully', () => {
    const { result } = renderHook(() =>
      useCommunityPlaytimeHistogramData({
        data: null,
        periodRange: 'week',
        labels: WEEKDAY_LABELS,
        offset: 0,
        axisColor: 'rgb(100,100,100)',
        primaryColor: 'rgb(0,100,200)',
        purpleColor: 'rgb(168,85,247)',
        theme,
      })
    );

    expect(result.current.userTotalHours).toBe(0);
    expect(result.current.communityTotalHours).toBe(0);
    expect(result.current.userTotalLabel).toBe('0h');
    expect(result.current.communityTotalLabel).toBe('0h');
    expect(result.current.hasPlaytime).toBe(false);
    expect(result.current.maxVisibleHours).toBe(0);
  });
});
