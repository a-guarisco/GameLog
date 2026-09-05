import { isDevMenuEnabled } from '@gamelog/common/devMenuConfig';

describe('devMenuConfig', () => {
  const originalEnableDevMenu = process.env.EXPO_PUBLIC_ENABLE_DEV_MENU;
  const originalIsDev = process.env.EXPO_PUBLIC_IS_DEV;

  afterEach(() => {
    if (originalEnableDevMenu !== undefined) {
      process.env.EXPO_PUBLIC_ENABLE_DEV_MENU = originalEnableDevMenu;
    } else {
      delete process.env.EXPO_PUBLIC_ENABLE_DEV_MENU;
    }

    if (originalIsDev !== undefined) {
      process.env.EXPO_PUBLIC_IS_DEV = originalIsDev;
    } else {
      delete process.env.EXPO_PUBLIC_IS_DEV;
    }
  });

  it('returns true when EXPO_PUBLIC_ENABLE_DEV_MENU is "true"', () => {
    process.env.EXPO_PUBLIC_ENABLE_DEV_MENU = 'true';
    process.env.EXPO_PUBLIC_IS_DEV = 'false';
    expect(isDevMenuEnabled()).toBe(true);
  });

  it('returns false when EXPO_PUBLIC_ENABLE_DEV_MENU is "false"', () => {
    process.env.EXPO_PUBLIC_ENABLE_DEV_MENU = 'false';
    process.env.EXPO_PUBLIC_IS_DEV = 'true';
    expect(isDevMenuEnabled()).toBe(false);
  });

  it('falls back to EXPO_PUBLIC_IS_DEV when EXPO_PUBLIC_ENABLE_DEV_MENU is not set', () => {
    delete process.env.EXPO_PUBLIC_ENABLE_DEV_MENU;
    process.env.EXPO_PUBLIC_IS_DEV = 'true';
    expect(isDevMenuEnabled()).toBe(true);

    process.env.EXPO_PUBLIC_IS_DEV = 'false';
    expect(isDevMenuEnabled()).toBe(false);
  });
});
