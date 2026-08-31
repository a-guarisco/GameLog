import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import { Box } from '@gamelog/common/gluestack/box';
import Chip from '@gamelog/common/Chip';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';

interface ProfileIdentityProps {
  name: string;
  avatarUrl?: string;
  streakText: string;
  memberSinceLabel?: string | null;
  mostPlayedName?: string;
}

const ProfileIdentity = ({
  name,
  avatarUrl,
  streakText,
  memberSinceLabel,
}: ProfileIdentityProps) => {
  return (
    <Box className="w-full items-center z-10" style={{ height: 0, overflow: 'visible' }}>
      <VStack space="xs" className="absolute w-full items-center" style={{ top: -136 }}>
        <Avatar size="xl" className="border-[4px] border-background-0 bg-background-300 z-10">
          <AvatarFallbackText>{name}</AvatarFallbackText>
          {!!avatarUrl && (
            <AvatarImage source={{ uri: avatarUrl }} alt={`${name} avatar`} resizeMode="cover" />
          )}
        </Avatar>

        <Box className="bg-background-0 px-4 py-1 rounded-full z-10">
          <PageTitle size="xl" className="text-center" numberOfLines={1}>
            {name}
          </PageTitle>
        </Box>

        <HStack space="xs" className="flex-wrap items-center justify-center z-10">
          <Chip
            className="bg-primary-500 border-[4px] border-background-0"
            testID="profile-streak-chip"
          >
            <Text size="xs" className="font-bold text-white">
              {streakText}
            </Text>
          </Chip>

          {!!memberSinceLabel && (
            <Chip
              className="bg-background-200 border-[4px] border-background-0"
              testID="profile-member-since-chip"
            >
              <Text size="xs" className="font-bold text-typography-100">
                {memberSinceLabel}
              </Text>
            </Chip>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProfileIdentity;
