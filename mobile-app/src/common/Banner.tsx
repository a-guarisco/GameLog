import { useWindowDimensions } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';
import { LinearGradient } from 'expo-linear-gradient';

interface BannerProps {
  heightPercentage: number;
  minHeight: number;
  className?: string;
  imageUrl?: string;
}

export default function Banner({ heightPercentage, minHeight, className, imageUrl }: BannerProps) {
  const { height: screenHeight } = useWindowDimensions();
  const calculatedHeight = Math.max((screenHeight * heightPercentage) / 100, minHeight);

  return (
    <Box
      className={`w-full overflow-hidden relative bg-background-200 ${className ?? ''}`}
      style={{ height: calculatedHeight }}
    >
      {imageUrl && (
        <>
          <Image
            className="w-full h-full"
            source={{ uri: imageUrl }}
            alt="banner image"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            className="absolute bottom-0 left-0 right-0 h-1/2"
            pointerEvents="none"
          />
        </>
      )}
    </Box>
  );
}

