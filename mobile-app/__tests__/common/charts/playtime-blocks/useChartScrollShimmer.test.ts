import { renderHook, act } from '@testing-library/react-native';
import { useChartScrollShimmer } from '@gamelog/common/charts/playtime-blocks/useChartScrollShimmer';
import { Animated } from 'react-native';

describe('useChartScrollShimmer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with isScrolling false and default shimmerAnim', () => {
    const { result } = renderHook(() => useChartScrollShimmer());

    expect(result.current.isScrolling).toBe(false);
    expect(result.current.shimmerAnim).toBeInstanceOf(Animated.Value);
  });

  it('starts and stops animation when isScrolling toggles', () => {
    const spyLoop = jest.spyOn(Animated, 'loop');
    const { result, unmount } = renderHook(() => useChartScrollShimmer());

    act(() => {
      result.current.setIsScrolling(true);
    });

    expect(result.current.isScrolling).toBe(true);
    expect(spyLoop).toHaveBeenCalled();

    act(() => {
      result.current.setIsScrolling(false);
    });

    expect(result.current.isScrolling).toBe(false);

    unmount();
    spyLoop.mockRestore();
  });
});
