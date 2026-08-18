import { Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';

interface GameHeroProps {
  appid: string;
  name: string;
  onBack: () => void;
}

/**
 * Artwork only — the title block sits underneath on the page background so it stays
 * readable whatever the header image happens to look like.
 */
const GameHero = ({ appid, name, onBack }: GameHeroProps) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.max(screenHeight * 0.26, 220) + insets.top;

  // No padding on the container: the artwork is absolutely positioned, and padding on the
  // parent shrinks it, which left a strip of background showing under the image.
  return (
    <Box className="w-full overflow-hidden bg-background-200" style={{ height: heroHeight }}>
      {/* className, not style: gluestack's Image drops the style prop on native. */}
      <Image
        size="none"
        source={{ uri: steamAssetUrls.getGameHeaderImage(appid) }}
        alt={`${name} artwork`}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />

      {/* Top only, so the back button reads against bright art. The bottom is left alone:
          fading it into the page colour just washed out the artwork. */}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent']}
        locations={[0, 0.35]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%' }}
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
    </Box>
  );
};

export default GameHero;
