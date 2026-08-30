import { renderHook, waitFor } from '@testing-library/react-native';
import {
  getCommunityWeekRange,
  getCommunityMonthRange,
  useCommunityPlaytime,
} from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytime';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  __esModule: true,
  default: {
    getCommunityWeeklyPlaytime: jest.fn(),
    getCommunityMonthlyPlaytime: jest.fn(),
  },
}));

describe('useCommunityPlaytime date helpers', () => {
  it('computes correct week range starting on Monday and ending on Sunday', () => {
    // 2026-08-30 is Sunday
    const testDate = new Date('2026-08-30T12:00:00Z');
    const range = getCommunityWeekRange(testDate, 0);

    expect(range.startDate).toBe('2026-08-24'); // Monday
    expect(range.endDate).toBe('2026-08-30'); // Sunday
    expect(range.labels).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  });

  it('computes correct week range with offset', () => {
    const testDate = new Date('2026-08-30T12:00:00Z');
    const prevWeek = getCommunityWeekRange(testDate, -1);

    expect(prevWeek.startDate).toBe('2026-08-17');
    expect(prevWeek.endDate).toBe('2026-08-23');
  });

  it('computes correct 6-month block for 2nd half of year', () => {
    const testDate = new Date('2026-08-30T12:00:00Z');
    const range = getCommunityMonthRange(testDate, 0);

    expect(range.startDate).toBe('2026-07-01');
    expect(range.endDate).toBe('2026-12-31');
    expect(range.labels).toEqual(['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });

  it('computes correct 6-month block for 1st half of year', () => {
    const testDate = new Date('2026-03-15T12:00:00Z');
    const range = getCommunityMonthRange(testDate, 0);

    expect(range.startDate).toBe('2026-01-01');
    expect(range.endDate).toBe('2026-06-30');
    expect(range.labels).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  });

  it('computes previous semester with offset = -1', () => {
    const testDate = new Date('2026-08-30T12:00:00Z'); // in 2026 Jul-Dec
    const range = getCommunityMonthRange(testDate, -1);

    expect(range.startDate).toBe('2026-01-01');
    expect(range.endDate).toBe('2026-06-30');
    expect(range.labels).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  });

  it('fetches weekly playtime with correct parameters', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValueOnce({
      user: [1, 2, 3, 4, 5, 6, 7],
      community: [2, 2, 2, 2, 2, 2, 2],
    });

    const testDate = new Date('2026-08-30T12:00:00Z');
    const { result } = renderHook(() =>
      useCommunityPlaytime({
        scope: 'global',
        periodRange: 'week',
        offset: 0,
        currentDate: testDate,
      })
    );

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyPlaytime).toHaveBeenCalledWith(
        'global',
        '2026-08-24',
        '2026-08-30'
      );
      expect(result.current.data).toEqual({
        user: [1, 2, 3, 4, 5, 6, 7],
        community: [2, 2, 2, 2, 2, 2, 2],
      });
    });
  });
});
