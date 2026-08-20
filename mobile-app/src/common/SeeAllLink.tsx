import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface SeeAllLinkProps {
  label: string;
  onPress: () => void;
  accessibilityRole?: 'link' | 'button';
  testID?: string;
}

const SeeAllLink = ({ label, onPress, accessibilityRole = 'link', testID }: SeeAllLinkProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole={accessibilityRole}
    accessibilityLabel={label}
    testID={testID}
    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
    className="self-end"
  >
    <HStack space="xs" className="items-center py-3">
      <Text size="sm" className="font-bold text-primary-300">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={toHex(brand.primary['300'])} />
    </HStack>
  </Pressable>
);

export default SeeAllLink;
