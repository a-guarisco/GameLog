import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import { Text } from '@gamelog/common/gluestack/text';

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
    <Box className={`w-full px-4 py-3 justify-center ${className ?? ''}`}>
      <HStack className="items-center w-full justify-between">
        {/* The slot stays even without an icon, so the title keeps its centred position. */}
        <Box className="flex-1 flex-row justify-start items-center">
          {!!iconUrl && (
            <Avatar
              size="lg"
              className="-mt-7 border-2 border-background-100 shadow-md bg-background-300"
            >
              <AvatarFallbackText>{title}</AvatarFallbackText>
              <AvatarImage source={{ uri: iconUrl }} alt={`${title} icon`} resizeMode="cover" />
            </Avatar>
          )}
        </Box>

        <Text
          size="xl"
          className={`font-bold tracking-wide uppercase text-center px-2 text-typography-0 ${textClassName ?? ''}`}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Box className="flex-1 flex-row justify-end items-center">
          {secondaryText && (
            <Box className="bg-background-200 border border-outline-100 rounded-full px-3 py-1 shadow-sm">
              <Text size="xs" className="font-bold text-typography-100">
                {secondaryText}
              </Text>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default BannerInfo;
