import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { WarningHeading } from './WarningHeading';
import { WarningText } from './WarningText';

export const WarningBox = ({ message, classname }: { message: string; classname?: string }) => {
  return (
    <Box className={`items-center justify-center ${classname}`}>
      <HStack className="self-center items-center bg-warning-900 px-4 py-3 gap-x-3 rounded-lg border border-warning-800 max-w-[90%]">
        <Ionicons name="warning-outline" size={22} color={toHex(brand.warning['600'])} />
        <Box className="flex-shrink">
          <WarningHeading message="Warning" />
          {message && <WarningText message={message} />}
        </Box>
      </HStack>
    </Box>
  );
};
