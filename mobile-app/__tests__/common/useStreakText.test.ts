import { renderHook } from '@testing-library/react-hooks';
import { useStreakText } from '@gamelog/common/useStreakText';

describe('useStreakText', () => {
  it('returns "Loading streak..." when isLoading is true', () => {
    const { result } = renderHook(() => useStreakText(5, true));
    expect(result.current).toBe('Loading streak...');
  });

  it('returns "Loading streak..." when isLoading is true even if streak is null or undefined', () => {
    const { result: nullResult } = renderHook(() => useStreakText(null, true));
    expect(nullResult.current).toBe('Loading streak...');

    const { result: undefinedResult } = renderHook(() => useStreakText(undefined, true));
    expect(undefinedResult.current).toBe('Loading streak...');
  });

  it('returns formatted fire streak string for positive streak numbers', () => {
    const { result: result5 } = renderHook(() => useStreakText(5, false));
    expect(result5.current).toBe('🔥 5 day streak');

    const { result: result1 } = renderHook(() => useStreakText(1, false));
    expect(result1.current).toBe('🔥 1 day streak');
  });

  it('returns "0 day streak" when streak is 0', () => {
    const { result } = renderHook(() => useStreakText(0, false));
    expect(result.current).toBe('0 day streak');
  });

  it('returns "0 day streak" when streak is null', () => {
    const { result } = renderHook(() => useStreakText(null, false));
    expect(result.current).toBe('0 day streak');
  });

  it('returns "0 day streak" when streak is undefined', () => {
    const { result } = renderHook(() => useStreakText(undefined, false));
    expect(result.current).toBe('0 day streak');
  });

  it('returns "0 day streak" when streak is negative', () => {
    const { result } = renderHook(() => useStreakText(-3, false));
    expect(result.current).toBe('0 day streak');
  });
});
