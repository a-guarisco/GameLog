import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/components/ui/avatar';
import { Text } from '@gamelog/components/ui/text';

interface BannerInfoProps {
  title: string;
  backgroundColor?: string;
  height?: string;
  secondaryText?: string;
  iconUrl?: string;
  textColor?: string;
  justifyContent?: string;
}

const BannerInfo = ({
  title,
  secondaryText,
  iconUrl,
  backgroundColor,
  textColor,
  height,
  justifyContent,
}: BannerInfoProps) => {
  return (
    <Box
      className={`mb-3 w-full p-3 flex ${justifyContent ?? 'justify-center'} ${backgroundColor ?? ''} ${height ?? ''}`}
    >
      <HStack className="items-center w-full justify-between">
        <Box className="flex-1 flex-row justify-start">
          <Avatar size="md">
            <AvatarFallbackText>{title}</AvatarFallbackText>
            <AvatarImage source={{ uri: iconUrl }} alt={`${title} icon`} resizeMode="cover" />
          </Avatar>
        </Box>

        <Text size="2xl" className={`font-bold uppercase text-center px-2 ${textColor ?? ''}`}>
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
