import { FC } from 'react';
import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'nativewind';

export const GoogleGIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export interface GLGoogleButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  text?: string;
  className?: string;
  testID?: string;
}

export const GLGoogleButton: FC<GLGoogleButtonProps> = ({
  onPress,
  isLoading = false,
  isDisabled = false,
  text = 'Continue with Google',
  className = '',
  testID = 'gl-google-button',
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseContainerStyle =
    'h-12 w-full flex-row items-center justify-center rounded-xl px-4 border active:opacity-80';

  // Official Google Identity Branding Specs:
  // Light: White bg (#FFFFFF), neutral border (#747775 or border-outline-200), dark text (#1F1F1F)
  // Dark: Dark neutral bg (#131314), dark border (#444746 or border-outline-800), light text (#E3E3E3)
  const themeContainerStyle = isDark
    ? 'bg-[#131314] border-[#444746] active:bg-[#1f1f20]'
    : 'bg-[#FFFFFF] border-[#747775] active:bg-[#f8f9fa]';

  const themeTextStyle = isDark ? 'text-[#E3E3E3]' : 'text-[#1F1F1F]';

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
        <Spinner size="small" color={isDark ? '#E3E3E3' : '#1F1F1F'} className="mr-3" />
      ) : (
        <GoogleGIcon size={20} />
      )}
      <Text className={`ml-3 font-medium text-base ${themeTextStyle}`}>{text}</Text>
    </Pressable>
  );
};
