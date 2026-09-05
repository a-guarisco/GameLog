/**
 * Evaluates whether the Developer Dashboard tab & dev screens should be enabled in the UI.
 * 
 * - If `EXPO_PUBLIC_ENABLE_DEV_MENU` is explicitly provided ('true' or 'false'), it takes precedence.
 * - Otherwise, falls back to `EXPO_PUBLIC_IS_DEV === 'true'`.
 */
export const isDevMenuEnabled = (): boolean => {
  const enableDevMenu = process.env.EXPO_PUBLIC_ENABLE_DEV_MENU;
  if (typeof enableDevMenu === 'string') {
    return enableDevMenu.trim().toLowerCase() === 'true';
  }

  return process.env.EXPO_PUBLIC_IS_DEV === 'true';
};
