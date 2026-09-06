import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ViewProps } from 'react-native';

import { HEX_COLORS } from '@gamelog/theme/hexColors';

export type FeedbackType = 'error' | 'success' | 'warning' | 'info';
export type FeedbackVariant = 'solid' | 'icon-top';

interface FeedbackBoxProps extends ViewProps {
  type: FeedbackType;
  variant?: FeedbackVariant;
  title?: string;
  message: string | null;
  className?: string;
}

const FEEDBACK_CONFIG = {
  error: {
    icon: 'alert-circle-outline',
    defaultTitle: 'Error',
    bgClass: 'bg-error-0 border-error-300 dark:bg-error-900 dark:border-error-800',
    solidTextClass: 'text-error-500',
    solidIconColor: HEX_COLORS.feedback.error.hex,
    iconTopTextClass: 'text-error-500',
    iconTopIconColor: HEX_COLORS.feedback.error.hex,
  },
  success: {
    icon: 'checkmark-circle-outline',
    defaultTitle: 'Success',
    bgClass: 'bg-success-0 border-success-300 dark:bg-success-900 dark:border-success-800',
    solidTextClass: 'text-success-600',
    solidIconColor: HEX_COLORS.feedback.success.hex,
    iconTopTextClass: 'text-success-600',
    iconTopIconColor: HEX_COLORS.feedback.success.hex,
  },
  warning: {
    icon: 'warning-outline',
    defaultTitle: 'Warning',
    bgClass: 'bg-warning-0 border-warning-300 dark:bg-warning-900 dark:border-warning-800',
    solidTextClass: 'text-warning-500',
    solidIconColor: HEX_COLORS.feedback.warning.hex,
    iconTopTextClass: 'text-warning-500',
    iconTopIconColor: HEX_COLORS.feedback.warning.hex,
  },
  info: {
    icon: 'information-circle-outline',
    defaultTitle: 'Info',
    bgClass: 'bg-primary-0 border-primary-300 dark:bg-primary-900 dark:border-primary-800',
    solidTextClass: 'text-primary-500',
    solidIconColor: HEX_COLORS.feedback.info.hex,
    iconTopTextClass: 'text-primary-500',
    iconTopIconColor: HEX_COLORS.feedback.info.hex,
  },
} as const;

export const FeedbackBox = ({
  type,
  variant = 'icon-top',
  title,
  message,
  className,
  ...props
}: FeedbackBoxProps) => {
  const config = FEEDBACK_CONFIG[type];
  const displayTitle = title || config.defaultTitle;

  if (variant === 'icon-top') {
    return (
      <Box {...props} className={`items-center justify-center p-4 ${className || ''}`}>
        <VStack space="sm" className="items-center">
          <Ionicons name={config.icon} size={32} color={config.iconTopIconColor} />
          <Text className={`font-bold text-lg ${config.iconTopTextClass}`}>{displayTitle}</Text>
          {message && <Text className="text-center opacity-90 text-typography-0">{message}</Text>}
        </VStack>
      </Box>
    );
  }

  return (
    <Box {...props} className={`items-center justify-center ${className || ''}`}>
      <HStack
        className={`self-center items-center px-4 py-3 gap-x-3 rounded-lg border max-w-[90%] ${config.bgClass}`}
      >
        <Ionicons name={config.icon} size={22} color={config.solidIconColor} />
        <Box className="flex-shrink">
          <Text className={`font-bold ${config.solidTextClass}`}>{displayTitle}</Text>
          {message && (
            <Text className={`text-sm leading-4 opacity-90 ${config.solidTextClass}`}>
              {message}
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

// Legacy Wrappers
interface LegacyFeedbackProps extends ViewProps {
  title?: string;
  message?: string;
  errorMessage?: string | null;
  className?: string;
  isOnCard?: boolean;
  variant?: FeedbackVariant;
}

export const ErrorBox = ({ errorMessage, message, title, ...props }: LegacyFeedbackProps) => (
  <FeedbackBox type="error" title={title} message={errorMessage || message || null} {...props} />
);

export const SuccessBox = ({ message, ...props }: LegacyFeedbackProps) => (
  <FeedbackBox type="success" message={message || null} {...props} />
);

export const WarningBox = ({ message, ...props }: LegacyFeedbackProps) => (
  <FeedbackBox type="warning" message={message || null} {...props} />
);

export const InfoBox = ({ message, ...props }: LegacyFeedbackProps) => (
  <FeedbackBox type="info" message={message || null} {...props} />
);
