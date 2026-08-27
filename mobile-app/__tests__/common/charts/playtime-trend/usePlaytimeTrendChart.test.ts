import { renderHook } from '@testing-library/react-native';
import { usePlaytimeTrendChart } from '@gamelog/common/charts/playtime-trend/usePlaytimeTrendChart';

describe('usePlaytimeTrendChart', () => {
  const getOffsetDateString = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const mockPlaytime = [
    { date: getOffsetDateString(0), playtime_minutes: 120 },
    { date: getOffsetDateString(-1), playtime_minutes: 60 },
    { date: getOffsetDateString(-20), playtime_minutes: 500 },
  ];

  it('calculates avg mode correctly', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 14, 'avg'));
    expect(result.current.trend.hasPlaytime).toBe(true);
    expect(result.current.lineData.length).toBeGreaterThan(0);
  });

  it('calculates tot mode correctly', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 14, 'tot'));
    expect(result.current.trend.hasPlaytime).toBe(true);
    expect(result.current.lineData.length).toBeGreaterThan(0);
  });

  it('handles empty playtime', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(null, 14, 'avg'));
    expect(result.current.trend.hasPlaytime).toBe(false);
  });
});
