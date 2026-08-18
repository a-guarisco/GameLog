import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface SeeAllLinkProps {
  label: string;
  onPress: () => void;
  /** 'link' for anything that leaves the app, 'button' for in-app navigation. */
  accessibilityRole?: 'link' | 'button';
  testID?: string;
}

/** Shared "see all" affordance that closes every feed section on the game view. */
const SeeAllLink = ({ label, onPress, accessibilityRole = 'link', testID }: SeeAllLinkProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole={accessibilityRole}
    accessibilityLabel={label}
    testID={testID}
    // The row is short, so the touch target is padded out to stay thumb-sized.
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
