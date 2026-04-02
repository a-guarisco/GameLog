import { ViewProps } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { InfoHeading } from './InfoHeading';
import { InfoText } from './InfoText';

interface InfoBoxProps extends ViewProps {
  message: string;
  className?: string;
}

export const InfoBox = ({ message, className, ...props }: InfoBoxProps) => (
  <Box {...props} className={`items-center justify-center ${className}`}>
    <HStack className="self-center items-center bg-info-900 px-4 py-3 gap-x-3 rounded-lg border border-info-800 max-w-[90%]">
      <Ionicons name="information-circle-outline" size={22} color={toHex(brand.info['600'])} />
      <Box className="flex-shrink">
        <InfoHeading message="Info" />
        {message && <InfoText message={message} />}
      </Box>
    </HStack>
  </Box>
);
