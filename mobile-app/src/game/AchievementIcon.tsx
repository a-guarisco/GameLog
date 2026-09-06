import { useColorScheme } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface AchievementIconProps {
  isUnlocked: boolean;
  size?: number;
}

const AchievementIcon = ({ isUnlocked, size = 20 }: AchievementIconProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!isUnlocked) {
    const lockColor = isDark
      ? toHex(brand.typographyDark['400'])
      : toHex(brand.typographyLight['400']);

    return (
      <Ionicons name="lock-closed" size={size} color={lockColor} testID="achievement-icon-locked" />
    );
  }

  const trophyColor = isDark ? toHex(brand.primary['400']) : toHex(brand.primary['500']);

  return (
    <Ionicons name="trophy" size={size} color={trophyColor} testID="achievement-icon-unlocked" />
  );
};

export default AchievementIcon;
