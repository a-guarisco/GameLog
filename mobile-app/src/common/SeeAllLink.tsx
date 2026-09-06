import { Pressable, useColorScheme } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { SeeMoreText } from '@gamelog/common/typography/CardTypography';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface SeeAllLinkProps {
  label: string;
  onPress: () => void;
  accessibilityRole?: 'link' | 'button';
  testID?: string;
}

const SeeAllLink = ({ label, onPress, accessibilityRole = 'link', testID }: SeeAllLinkProps) => {
  const isDark = useColorScheme() === 'dark';
  const chevronColor = isDark
    ? toHex(brand.typographyDark['300'])
    : toHex(brand.typographyLight['300']);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      testID={testID}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      className="self-end"
    >
      <HStack space="xs" className="items-center py-3">
        <SeeMoreText>{label}</SeeMoreText>
        <Ionicons name="chevron-forward" size={14} color={chevronColor} />
      </HStack>
    </Pressable>
  );
};

export default SeeAllLink;
