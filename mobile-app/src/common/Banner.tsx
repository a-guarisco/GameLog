// Banner.tsx
import { useWindowDimensions } from 'react-native';
import { Box } from "@gamelog/components/ui/box";
import { Image } from "@gamelog/components/ui/image";

interface BannerProps {
    heightPercentage: number;
    minHeight: number;
    fallbackColor: string;
    imageUrl?: string;
}

export default function Banner({ heightPercentage, minHeight, fallbackColor, imageUrl }: BannerProps) {
    const { height: screenHeight } = useWindowDimensions();
    const calculatedHeight = Math.max((screenHeight * heightPercentage) / 100, minHeight);

    return (
        <Box
            className={`w-full overflow-hidden rounded-t-lg ${fallbackColor}`}
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
    )
}