import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

interface BackButtonProps {
  onPress: () => void;
  className?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const BackButton = ({
  onPress,
  className = '',
  testID = 'back-button',
  style,
}: BackButtonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      testID={testID}
      hitSlop={8}
      className={`absolute left-4 z-50 h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/40 ${className}`}
      style={[{ top: insets.top + 8 }, style]}
    >
      <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
    </Pressable>
  );
};

export default BackButton;
