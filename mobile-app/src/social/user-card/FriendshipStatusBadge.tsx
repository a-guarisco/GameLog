import React from 'react';
import Chip, { ChipVariant } from '@gamelog/common/Chip';
import { Text } from '@gamelog/common/gluestack/text';
import {
  FriendshipBadgeConfig,
  getFriendshipStatusStyle,
} from './friendshipStatus';

interface FriendshipStatusBadgeProps {
  status?: string | null;
  config?: FriendshipBadgeConfig;
  variant?: ChipVariant;
  className?: string;
  testID?: string;
}

export const FriendshipStatusBadge: React.FC<FriendshipStatusBadgeProps> = ({
  status,
  config,
  variant = 'pill',
  className = '',
  testID,
}) => {
  const resolvedStatus =
    status !== undefined
      ? status
      : config
        ? config.tone === 'success'
          ? 'accepted'
          : config.tone === 'error'
            ? 'blocked'
            : 'pending_outgoing'
        : undefined;
  const style = getFriendshipStatusStyle(resolvedStatus);
  const label = config?.label ?? style.label;

  return (
    <Chip
      variant={variant}
      className={`${style.bgClass} ${style.borderClass} border-[1px] ${className}`}
      testID={testID}
    >
      <Text size="xs" className={`font-bold ${style.textClass}`}>
        {label}
      </Text>
    </Chip>
  );
};

export default FriendshipStatusBadge;
