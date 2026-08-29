import { renderHook } from '@testing-library/react-native';
import { useOrientation } from '@gamelog/common/useOrientation';
import { Dimensions } from 'react-native';

describe('useOrientation hook', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns isLandscape: false when width < height (portrait)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 1,
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.width).toBe(390);
    expect(result.current.height).toBe(844);
  });

  it('returns isLandscape: true when width >= height (landscape)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 844,
      height: 390,
      scale: 3,
      fontScale: 1,
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.width).toBe(844);
    expect(result.current.height).toBe(390);
  });
});
