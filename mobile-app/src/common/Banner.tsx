import { useWindowDimensions } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';

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
      className={`w-full overflow-hidden rounded-t-lg ${className ?? ''}`}
      style={{ height: calculatedHeight }}
    >
      {imageUrl && (
        <Image
          className="w-full h-full"
          source={{ uri: imageUrl }}
          alt="banner image"
          resizeMode="cover"
        />
      )}
    </Box>
  );
}
