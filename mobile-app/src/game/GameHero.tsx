import { Pressable, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Image } from '@gamelog/common/gluestack/image';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { formatThousands } from '@gamelog/utils/formatUtils';

interface GameHeroProps {
  appid: string;
  name: string;
  livePlayers: number;
  streakText: string;
  onBack: () => void;
}

const Chip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <HStack className={`items-center rounded-full border px-3 py-1.5 ${className}`} space="xs">
    {children}
  </HStack>
);

const GameHero = ({ appid, name, livePlayers, streakText, onBack }: GameHeroProps) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const isDark = useColorScheme() === 'dark';

  // Fade the art into whichever background the page actually sits on, so the hero
  // does not cut off against a light theme.
  const pageBackground = (isDark ? rawConfig.dark : rawConfig.light)['--color-background-0']
    .split(' ')
    .join(',');
  // justify-end keeps the title block in flow at the bottom; absolute positioning
  // collapsed against the status bar.
  const heroHeight = Math.max(screenHeight * 0.28, 240) + insets.top;

  return (
    <Box
      className="w-full justify-end overflow-hidden bg-background-200"
      style={{ height: heroHeight, paddingTop: insets.top }}
    >
      {/* className, not style: gluestack's Image drops the style prop on native. */}
      <Image
        size="none"
        source={{ uri: steamAssetUrls.getGameHeaderImage(appid) }}
        alt={`${name} artwork`}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent', `rgba(${pageBackground},1)`]}
        locations={[0, 0.35, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        testID="game-hero-back"
        hitSlop={8}
        className="absolute left-4 h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/40"
        style={{ top: insets.top + 8 }}
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>

      <Box className="px-4 pb-4">
        <Text
          size="3xl"
          className="mb-3 font-bold text-white"
          style={{ letterSpacing: -0.5 }}
          numberOfLines={2}
        >
          {name}
        </Text>

        <HStack space="sm" className="flex-wrap items-center">
          <Chip className="border-primary-400 bg-primary-500/25">
            <Box className="h-1.5 w-1.5 rounded-full bg-primary-100" />
            <Text size="xs" className="font-bold text-primary-100">
              {formatThousands(livePlayers)} playing now
            </Text>
          </Chip>

          <Chip className="border-white/15 bg-white/10">
            <Text size="xs" className="font-bold text-white">
              {streakText}
            </Text>
          </Chip>
        </HStack>
      </Box>
    </Box>
  );
};

export default GameHero;
