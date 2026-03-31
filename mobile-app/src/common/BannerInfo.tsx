import { Box } from '@gamelog/components/ui/box';
import { HStack } from '@gamelog/components/ui/hstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/components/ui/avatar';
import { Text } from '@gamelog/components/ui/text';

interface BannerInfoProps {
  title: string;
  secondaryText?: string;
  iconUrl?: string;
  textClassName?: string;
  className?: string;
}

const BannerInfo = ({
  title,
  secondaryText,
  iconUrl,
  textClassName,
  className,
}: BannerInfoProps) => {
  return (
    <Box className={`mb-3 w-full p-3 flex justify-center ${className ?? ''}`}>
      <HStack className="items-center w-full justify-between">
        <Box className="flex-1 flex-row justify-start">
          <Avatar size="md">
            <AvatarFallbackText>{title}</AvatarFallbackText>
            <AvatarImage source={{ uri: iconUrl }} alt={`${title} icon`} resizeMode="cover" />
          </Avatar>
        </Box>

        <Text size="2xl" className={`font-bold uppercase text-center px-2 ${textClassName ?? ''}`}>
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
