import { renderHook } from '@testing-library/react-native';
import { usePlaytimeBlocksData } from '@gamelog/common/charts/playtime-blocks/usePlaytimeBlocksData';
import { toIsoDate } from '@gamelog/utils/formatUtils';

describe('usePlaytimeBlocksData', () => {
  const MOCK_TODAY = new Date('2023-10-15T12:00:00Z');

  const getOffsetDateString = (offsetDays: number) => {
    const d = new Date(MOCK_TODAY);
    d.setDate(d.getDate() + offsetDays);
    return toIsoDate(d);
  };

  const theme = { '--color-primary-200': '1,1,1', '--color-background-100': '0,0,0' };
  const mockPlaytime = [{ date: "2023-10-15", playtime_minutes: 120 }, { date: "2023-10-14", playtime_minutes: 60 }];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(MOCK_TODAY);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

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
