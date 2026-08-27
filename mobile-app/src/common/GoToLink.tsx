import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { GoToText } from '@gamelog/common/typography/CardTypography';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface GoToLinkProps {
  label: string;
  onPress: () => void;
  accessibilityRole?: 'link' | 'button';
  testID?: string;
}

const GoToLink = ({ label, onPress, accessibilityRole = 'link', testID }: GoToLinkProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole={accessibilityRole}
    accessibilityLabel={label}
    testID={testID}
    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
    className="self-end"
  >
    <HStack space="xs" className="items-center py-3">
      <GoToText>{label}</GoToText>
      <Ionicons name="chevron-forward" size={14} color={toHex(brand.primary['300'])} />
    </HStack>
  </Pressable>
);

export default GoToLink;
