import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'nativewind';

export const FacebookLogo = ({
  size = 20,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill={color}
    />
  </Svg>
);

export interface GLFacebookButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  text?: string;
  className?: string;
  testID?: string;
}

export const GLFacebookButton: React.FC<GLFacebookButtonProps> = ({
  onPress,
  isLoading = false,
  isDisabled = false,
  text = 'Continue with Facebook',
  className = '',
  testID = 'gl-facebook-button',
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseContainerStyle =
    'h-12 w-full flex-row items-center justify-center rounded-xl px-4 border active:opacity-80';

  // Official Facebook Branding Specs:
  // Brand Primary: #1877F2
  // Light: Solid #1877F2 bg, border #1877F2, white text
  // Dark: Dark Blue/Neutral #1877F2 bg or #1877F2 border with dark bg #1877F2
  const themeContainerStyle = isDark
    ? 'bg-[#1877F2] border-[#1877F2] active:bg-[#166fe5]'
    : 'bg-[#1877F2] border-[#1877F2] active:bg-[#166fe5]';

  const textColor = '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      testID={testID}
      className={`${baseContainerStyle} ${themeContainerStyle} ${
        isDisabled || isLoading ? 'opacity-60' : ''
      } ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} className="mr-3" />
      ) : (
        <FacebookLogo size={20} color={textColor} />
      )}
      <Text className="ml-3 font-medium text-base text-white">{text}</Text>
    </Pressable>
  );
};
