import { renderHook } from '@testing-library/react-native';
import { usePlaytimeBlocksData } from '@gamelog/common/charts/playtime-blocks/usePlaytimeBlocksData';

describe('usePlaytimeBlocksData', () => {
  const getOffsetDateString = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const theme = { '--color-primary-200': '1,1,1', '--color-background-100': '0,0,0' };
  const mockPlaytime = [
    { date: getOffsetDateString(0), playtime_minutes: 120 },
    { date: getOffsetDateString(-1), playtime_minutes: 60 },
  ];

  it('calculates data for week mode correctly', () => {
    const { result } = renderHook(() =>
      usePlaytimeBlocksData(mockPlaytime, 'week', 0, null, 'red', 'blue', theme)
    );

    expect(result.current.summaryDays.length).toBeGreaterThan(0);
    expect(result.current.maxVisiblePlaytime).toBeGreaterThan(0);
  });

  it('calculates data for 14D mode correctly', () => {
    const { result } = renderHook(() =>
      usePlaytimeBlocksData(mockPlaytime, '14', 0, 0, 'red', 'blue', theme)
    );

    expect(result.current.summaryDays.length).toBeGreaterThan(0);
  });

  it('handles empty playtime', () => {
    const { result } = renderHook(() =>
      usePlaytimeBlocksData(null, 'week', 0, null, 'red', 'blue', theme)
    );

    expect(result.current.trend.hasPlaytime).toBe(false);
  });
});
