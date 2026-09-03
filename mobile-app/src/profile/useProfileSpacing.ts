import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDefaultBannerParams, useGetBannerHeight } from '@gamelog/utils/bannerUtils';
import { useOrientation } from '@gamelog/common/useOrientation';

export interface ProfileVSpaceOptions {
  bannerHeight: number;
  insetsTop: number;
  identityOffset?: number;
  avatarOverlap?: number;
  safeMargin?: number;
}

export const calculateProfileVSpace = ({
  bannerHeight,
  insetsTop,
  identityOffset = 80,
  avatarOverlap = 48,
  safeMargin = 8,
}: ProfileVSpaceOptions) => {
  const minAvatarTop = insetsTop + safeMargin;
  const desiredAvatarTop = bannerHeight - avatarOverlap;
  const actualAvatarTop = Math.max(desiredAvatarTop, minAvatarTop);
  const bannerOverlap = Math.max(0, bannerHeight - actualAvatarTop);
  const vspaceHeight = Math.max(0, identityOffset - bannerOverlap);

  return {
    vspaceHeight,
    avatarTop: actualAvatarTop,
    bannerOverlap,
  };
};

export const useProfileSpacing = (options?: Partial<ProfileVSpaceOptions>) => {
  const insets = useSafeAreaInsets();
  const { isTablet } = useOrientation();
  const { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO } = getDefaultBannerParams(isTablet);
  const bannerHeight = useGetBannerHeight(MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO);

  const { vspaceHeight, avatarTop, bannerOverlap } = calculateProfileVSpace({
    bannerHeight,
    insetsTop: insets.top,
    ...options,
  });

  return {
    vspaceHeight,
    avatarTop,
    bannerOverlap,
    bannerHeight,
    insetsTop: insets.top,
  };
};
