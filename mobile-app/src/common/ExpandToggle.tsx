import { Pressable, useColorScheme } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { SeeMoreText } from '@gamelog/common/typography/CardTypography';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

export interface ExpandToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
  labelCollapsed?: string;
  labelExpanded?: string;
  testID?: string;
  className?: string;
}

const ExpandToggle = ({
  isExpanded,
  onToggle,
  labelCollapsed = 'See details',
  labelExpanded = 'Hide details',
  testID,
  className = 'self-start mt-2',
}: ExpandToggleProps) => {
  const isDark = useColorScheme() === 'dark';
  const chevronColor = isDark 
    ? toHex(brand.typographyDark['300']) 
    : toHex(brand.typographyLight['300']);

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      testID={testID}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      className={className}
    >
      <HStack space="xs" className="items-center py-2">
        <SeeMoreText>{isExpanded ? labelExpanded : labelCollapsed}</SeeMoreText>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={chevronColor}
        />
      </HStack>
    </Pressable>
  );
};

export default ExpandToggle;
