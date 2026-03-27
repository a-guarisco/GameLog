import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { ErrorText } from './ErrorText';
import { ErrorHeading } from './ErrorHeading';

export const ErrorBox = ({
  errorMessage,
  className,
}: {
  errorMessage: string | null;
  className?: string;
}) => (
  <Box className={`items-center justify-center ${className}`}>
    <HStack className="self-center items-center bg-error-900 px-4 py-3 gap-x-3 rounded-lg border border-error-800 max-w-[90%]">
      <Ionicons name="alert-circle-outline" size={22} color={toHex(brand.error['600'])} />
      <Box className="flex-shrink">
        <ErrorHeading message="Error" />
        {errorMessage && <ErrorText message={errorMessage} />}
      </Box>
    </HStack>
  </Box>
);
