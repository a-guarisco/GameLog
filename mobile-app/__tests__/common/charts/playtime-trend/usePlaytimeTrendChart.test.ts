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

  it('uses weekly granularity for 90D in portrait mode', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 90, 'avg', false));
    expect(result.current.timeGroupMode).toBe('W');
  });

  it('retains daily granularity for 90D in landscape mode', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 90, 'avg', true));
    expect(result.current.timeGroupMode).toBe('D');
  });

  it('uses weekly granularity for 180D in landscape mode', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 180, 'avg', true));
    expect(result.current.timeGroupMode).toBe('W');
  });

  it('uses monthly granularity for >180D in landscape mode', () => {
    const { result } = renderHook(() => usePlaytimeTrendChart(mockPlaytime, 365, 'avg', true));
    expect(result.current.timeGroupMode).toBe('M');
  });
});
