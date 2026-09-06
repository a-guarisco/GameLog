import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import { Box } from '@gamelog/common/gluestack/box';
import Chip from '@gamelog/common/Chip';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';
import { MinimalBadge } from '@gamelog/common/MinimalBadge';

interface ProfileIdentityProps {
  name: string;
  avatarUrl?: string;
  streak: number;
  memberSinceLabel?: string | null;
  mostPlayedName?: string;
  isLandscape?: boolean;
}

const ProfileIdentity = ({
  name,
  avatarUrl,
  streak,
  memberSinceLabel,
  isLandscape = false,
}: ProfileIdentityProps) => {
  const content = (
    <>
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
        {!!memberSinceLabel && (
          <Chip
            className="bg-background-50 border border-outline-50 shadow-sm"
            testID="profile-member-since-chip"
          >
            <Text size="xs" className="font-bold text-typography-100">
              {memberSinceLabel}
            </Text>
          </Chip>
        )}

        <MinimalBadge
          iconName="flame"
          text={`${streak ?? 0} Days Streak`}
          colorHex={HEX_COLORS.dayStreak.hex}
          borderColorClass="border-semantic-dayStreak-600"
          textColorClass="text-semantic-dayStreak-600"
          bgClass="bg-semantic-dayStreak-100 dark:bg-semantic-dayStreak-900/40"
          testID="profile-streak-chip"
        />
      </HStack>
    </>
  );

  return (
    <Box className="w-full items-center z-10" style={{ height: 0, overflow: 'visible' }}>
      <VStack space="xs" className="absolute w-full items-center" style={{ top: -136 }}>
        {content}
      </VStack>
    </Box>
  );
};

export default ProfileIdentity;
