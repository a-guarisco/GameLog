export const NAV_RAIL_WIDTH_PHONE = 74;
export const NAV_RAIL_WIDTH_TABLET = 88;

export const getNavRailWidth = (isTablet: boolean): number => {
  return isTablet ? NAV_RAIL_WIDTH_TABLET : NAV_RAIL_WIDTH_PHONE;
};

export interface NavRailOffsetParams {
  isLandscape: boolean;
  isTablet: boolean;
  insetsLeft?: number;
}

export const shouldShowNavRail = (isLandscape: boolean, _isTablet?: boolean): boolean => {
  return isLandscape;
};

export const getNavRailOffset = ({
  isLandscape,
  isTablet,
  insetsLeft = 0,
}: NavRailOffsetParams): number => {
  if (!shouldShowNavRail(isLandscape, isTablet)) {
    return 0;
  }
  return insetsLeft + getNavRailWidth(isTablet);
};
