import { FC } from 'react';
import { Pressable } from 'react-native';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'nativewind';

export const GithubLogo = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
      fill={color}
    />
  </Svg>
);

export interface GLGithubButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  text?: string;
  className?: string;
  testID?: string;
}

export const GLGithubButton: FC<GLGithubButtonProps> = ({
  onPress,
  isLoading = false,
  isDisabled = false,
  text = 'Continue with GitHub',
  className = '',
  testID = 'gl-github-button',
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseContainerStyle =
    'h-12 w-full flex-row items-center justify-center rounded-xl px-4 border active:opacity-80';

  // Official GitHub Branding Specs:
  // Light: Dark #24292F bg, border #24292F, white text
  // Dark: Dark #21262D bg, border #30363D, light #F0F6FC text
  const themeContainerStyle = isDark
    ? 'bg-[#21262D] border-[#30363D] active:bg-[#262c36]'
    : 'bg-[#24292F] border-[#24292F] active:bg-[#1b1f23]';

  const textColor = isDark ? '#F0F6FC' : '#FFFFFF';

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
        <Spinner size="small" color={textColor} className="mr-3" />
      ) : (
        <GithubLogo size={20} color={textColor} />
      )}
      <Text className="ml-3 font-medium text-base text-white">{text}</Text>
    </Pressable>
  );
};
