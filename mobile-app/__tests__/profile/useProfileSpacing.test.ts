import { renderHook } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateProfileVSpace, useProfileSpacing } from '@gamelog/profile/useProfileSpacing';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

describe('calculateProfileVSpace', () => {
  it('calculates vspace and avatar position when safe area is small', () => {
    const result = calculateProfileVSpace({
      bannerHeight: 160,
      insetsTop: 44,
      identityOffset: 136,
      avatarOverlap: 48,
      safeMargin: 8,
    });

    expect(result.avatarTop).toBe(112); // 160 - 48 = 112 > 44 + 8 = 52
    expect(result.bannerOverlap).toBe(48);
    expect(result.vspaceHeight).toBe(88); // 136 - 48 = 88
    expect(result.avatarTop).toBeGreaterThanOrEqual(44 + 8);
  });

  it('adjusts avatar top to stay outside safe area when safe area is large relative to banner', () => {
    const insetsTop = 60;
    const bannerHeight = 100;
    const safeMargin = 8;

    const result = calculateProfileVSpace({
      bannerHeight,
      insetsTop,
      identityOffset: 136,
      avatarOverlap: 48,
      safeMargin,
    });

    // desiredAvatarTop would be 100 - 48 = 52, which is < insetsTop + safeMargin (68)
    // actualAvatarTop must be pushed down to 68
    expect(result.avatarTop).toBe(68);
    expect(result.avatarTop).toBeGreaterThanOrEqual(insetsTop + safeMargin);
    expect(result.bannerOverlap).toBe(32); // 100 - 68
    expect(result.vspaceHeight).toBe(104); // 136 - 32
  });

  it('handles zero insets gracefully', () => {
    const result = calculateProfileVSpace({
      bannerHeight: 140,
      insetsTop: 0,
      identityOffset: 136,
      avatarOverlap: 48,
      safeMargin: 8,
    });

    expect(result.avatarTop).toBe(92);
    expect(result.vspaceHeight).toBe(88);
  });
});

describe('useProfileSpacing', () => {
  beforeEach(() => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 47, bottom: 34, left: 0, right: 0 });
  });

  it('computes spacing using safe area insets hook', () => {
    const { result } = renderHook(() => useProfileSpacing());

    expect(result.current.insetsTop).toBe(47);
    expect(result.current.avatarTop).toBeGreaterThanOrEqual(47 + 8);
    expect(result.current.vspaceHeight).toBeGreaterThan(0);
  });
});
