import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { Button, ButtonText, ButtonSpinner } from '@gamelog/common/gluestack/button';

// ==========================================
// 1. Report CTA Button
// ==========================================
export interface ReportCtaButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  testID?: string;
  className?: string;
}

export const ReportCtaButton: React.FC<ReportCtaButtonProps> = ({
  onPress,
  isLoading = false,
  isDisabled = false,
  label = 'Generate Report',
  testID = 'generate-report-btn',
  className = '',
}) => {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      isOnCard
      action="primary"
      variant="solid"
      size="md"
      className={`self-center ${className}`}
      testID={testID}
    >
      {isLoading ? <ButtonSpinner className="mr-2" /> : null}
      <ButtonText>{label}</ButtonText>
    </Button>
  );
};

// ==========================================
// 2. Modal Confirmation & Cancel Buttons
// ==========================================
export interface ModalConfirmButtonProps {
  onPress: () => void;
  label?: string;
  variant?: 'primary' | 'destructive';
  isLoading?: boolean;
  isDisabled?: boolean;
  testID?: string;
  className?: string;
}

export const ModalConfirmButton: React.FC<ModalConfirmButtonProps> = ({
  onPress,
  label = 'Confirm',
  variant = 'destructive',
  isLoading = false,
  isDisabled = false,
  testID = 'modal-confirm-btn',
  className = '',
}) => {
  const isDestructive = variant === 'destructive';

  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      action={isDestructive ? 'negative' : 'primary'}
      variant="outline"
      size="sm"
      className={className}
      testID={testID}
    >
      {isLoading ? <ButtonSpinner className="mr-2" /> : null}
      <ButtonText>{label}</ButtonText>
    </Button>
  );
};

export interface ModalCancelButtonProps {
  onPress: () => void;
  label?: string;
  isDisabled?: boolean;
  testID?: string;
  className?: string;
}

export const ModalCancelButton: React.FC<ModalCancelButtonProps> = ({
  onPress,
  label = 'Cancel',
  isDisabled = false,
  testID = 'modal-cancel-btn',
  className = '',
}) => {
  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled}
      action="secondary"
      variant="outline"
      size="sm"
      className={className}
      testID={testID}
    >
      <ButtonText>{label}</ButtonText>
    </Button>
  );
};

// ==========================================
// 3. Social / Friendship Action Buttons
// ==========================================
export type SocialActionType = 'accept' | 'refuse' | 'add';

export interface SocialActionButtonProps {
  actionType: SocialActionType;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  label?: string;
  testID?: string;
  className?: string;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  actionType,
  onPress,
  isDisabled = false,
  isLoading = false,
  label,
  testID,
  className = '',
}) => {
  if (actionType === 'accept') {
    return (
      <Button
        onPress={onPress}
        isDisabled={isDisabled || isLoading}
        action="primary"
        variant="outline"
        size="xs"
        className={className}
        testID={testID}
      >
        {isLoading ? (
          <ButtonSpinner className="mr-1" />
        ) : (
          <Ionicons
            name="checkmark"
            size={13}
            color={HEX_COLORS.social.action.accept.hex}
            style={{ marginRight: 2 }}
          />
        )}
        <ButtonText>{label ?? 'Accept'}</ButtonText>
      </Button>
    );
  }

  if (actionType === 'refuse') {
    return (
      <Button
        onPress={onPress}
        isDisabled={isDisabled || isLoading}
        action="secondary"
        variant="outline"
        size="xs"
        className={className}
        testID={testID}
      >
        {isLoading ? (
          <ButtonSpinner className="mr-1" />
        ) : (
          <Ionicons
            name="close"
            size={13}
            color={HEX_COLORS.social.action.neutral.hex}
            style={{ marginRight: 2 }}
          />
        )}
        <ButtonText>{label ?? 'Refuse'}</ButtonText>
      </Button>
    );
  }

  return (
    <Button
      onPress={onPress}
      isDisabled={isDisabled || isLoading}
      action="primary"
      variant="outline"
      size="xs"
      className={className}
      testID={testID}
    >
      {isLoading ? (
        <ButtonSpinner className="mr-1" />
      ) : (
        <Ionicons
          name="person-add"
          size={13}
          color={HEX_COLORS.social.action.add.hex}
          style={{ marginRight: 2 }}
        />
      )}
      <ButtonText>{label ?? 'Add Friend'}</ButtonText>
    </Button>
  );
};
