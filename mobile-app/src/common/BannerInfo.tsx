import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/components/ui/avatar';
import { Text } from '@gamelog/components/ui/text';

interface BannerInfoProps {
  title: string;
  backgroundColor?: string;
  height?: number;
  secondaryText?: string;
  iconUrl?: string;
  textColor?: string;
}

const BannerInfo = ({
  title,
  secondaryText,
  iconUrl,
  backgroundColor,
  textColor,
  height,
}: BannerInfoProps) => {
  const textStyle = textColor ? { color: textColor } : undefined;
  const boxStyle = {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <Box
      className="rounded-lg border-2 border-outline-500 mb-3 w-full p-3 flex justify-center"
      style={boxStyle}
    >
      <HStack className="items-center w-full justify-between">
        <Box className="flex-1 flex-row justify-start">
          <Avatar size="md">
            <AvatarFallbackText>{title}</AvatarFallbackText>
            <AvatarImage source={{ uri: iconUrl }} />
          </Avatar>
        </Box>

        <Text size="2xl" className="font-bold uppercase text-center px-2" style={textStyle}>
          {title}
        </Text>

        <Box className="flex-1 flex-row justify-end">
          <Text size="sm" className="font-bold">
            {secondaryText}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default BannerInfo;
