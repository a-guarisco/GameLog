import { ViewProps } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { SuccessHeading } from './SuccessHeading';
import { SuccessText } from './SuccessText';

interface SuccessBoxProps extends ViewProps {
  message: string;
  className?: string;
}

export const SuccessBox = ({ message, className, ...props }: SuccessBoxProps) => (
  <Box {...props} className={`items-center justify-center ${className}`}>
    <HStack className="self-center items-center bg-success-900 px-4 py-3 gap-x-3 rounded-lg border border-success-800 max-w-[90%]">
      <Ionicons name="checkmark-circle-outline" size={22} color={toHex(brand.success['600'])} />
      <Box className="flex-shrink">
        <SuccessHeading message="Success" />
        {message && <SuccessText message={message} />}
      </Box>
    </HStack>
  </Box>
);
