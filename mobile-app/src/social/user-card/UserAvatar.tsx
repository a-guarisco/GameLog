import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { useSteamAvatar } from '../useSteamAvatars';

export interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  steamId?: string | null;
  isHighlighted?: boolean;
  testID?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl: propAvatarUrl,
  steamId,
  isHighlighted,
  testID = 'user-avatar',
}) => {
  const hookAvatarUrl = useSteamAvatar(propAvatarUrl ? undefined : steamId);
  const effectiveAvatarUrl = propAvatarUrl ?? hookAvatarUrl;

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [effectiveAvatarUrl]);

  const showImage = !!effectiveAvatarUrl && !imageError;

  return (
    <Box
      className={`w-10 h-10 rounded-lg items-center justify-center shrink-0 overflow-hidden ${
        isHighlighted
          ? 'bg-primary-500/15 dark:bg-primary-500/25 border border-primary-500/30'
          : 'bg-background-100 dark:bg-background-200 border border-outline-100 dark:border-outline-50'
      }`}
      testID={testID}
    >
      {showImage ? (
        <Image
          source={{ uri: effectiveAvatarUrl }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
          testID="user-avatar-image"
        />
      ) : (
        <Text
          className={`font-bold text-base uppercase ${
            isHighlighted
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-typography-400 dark:text-typography-300'
          }`}
          testID="user-avatar-fallback-text"
        >
          {username ? username.charAt(0) : 'U'}
        </Text>
      )}
    </Box>
  );
};

export default UserAvatar;
