import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { ErrorText } from './ErrorText';
import { ErrorHeading } from './ErrorHeading';
import { ViewProps } from 'react-native';

interface ErrorBoxProps extends ViewProps {
  errorMessage: string | null;
  className?: string;
}

export const ErrorBox = ({ errorMessage, className, ...props }: ErrorBoxProps) => (
  <Box {...props} className={`items-center justify-center ${className}`}>
    <HStack className="self-center items-center bg-error-900 px-4 py-3 gap-x-3 rounded-lg border border-error-800 max-w-[90%]">
      <Ionicons name="alert-circle-outline" size={22} color={toHex(brand.error['600'])} />
      <Box className="flex-shrink">
        <ErrorHeading message="Error" />
        {errorMessage && <ErrorText message={errorMessage} />}
      </Box>
    </HStack>
  </Box>
);
