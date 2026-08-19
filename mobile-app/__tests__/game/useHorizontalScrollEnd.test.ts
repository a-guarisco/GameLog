import { renderHook } from '@testing-library/react-native';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import useHorizontalScrollEnd from '@gamelog/game/useHorizontalScrollEnd';

// Only nativeEvent is read by the hook, so the synthetic-event envelope is cast rather
// than stubbed out in full.
const createScrollEvent = (x: number, contentWidth: number) =>
  ({
  nativeEvent: {
    contentOffset: { x, y: 0 },
    layoutMeasurement: { width: 400, height: 100 },
    contentSize: { width: contentWidth, height: 100 },
    zoomScale: 1,
    contentInset: { top: 0, left: 0, bottom: 0, right: 0 },
  },
  }) as NativeSyntheticEvent<NativeScrollEvent>;

describe('useHorizontalScrollEnd', () => {
  it('does not invoke onEndReached if scroll distance to end exceeds threshold', () => {
    const onEndReached = jest.fn();
    const { result } = renderHook(() => useHorizontalScrollEnd(onEndReached, 200));

    // contentSize = 2000, layoutMeasurement = 400, x = 1000. distanceToEnd = 2000 - 1400 = 600 (> 200)
    result.current.handleScroll(createScrollEvent(1000, 2000));
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('invokes onEndReached when scroll distance to end is within threshold', () => {
    const onEndReached = jest.fn();
    const { result } = renderHook(() => useHorizontalScrollEnd(onEndReached, 200));

    // contentSize = 2000, layoutMeasurement = 400, x = 1450. distanceToEnd = 2000 - 1850 = 150 (<= 200)
    result.current.handleScroll(createScrollEvent(1450, 2000));
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('handles undefined onEndReached gracefully', () => {
    const { result } = renderHook(() => useHorizontalScrollEnd());
    expect(() => result.current.handleScroll(createScrollEvent(1900, 2000))).not.toThrow();
  });
});
