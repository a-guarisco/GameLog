import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import Chip from '@gamelog/common/Chip';

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
}: ProfileIdentityProps) => (
  <>
    <VStack space="sm" className="items-center bg-background-0 px-5 pb-4">
      <Avatar size="xl" className="-mt-9 border-4 border-background-0 bg-background-300">
        <AvatarFallbackText>{name}</AvatarFallbackText>
        {!!avatarUrl && (
          <AvatarImage source={{ uri: avatarUrl }} alt={`${name} avatar`} resizeMode="cover" />
        )}
      </Avatar>

      <Text size="2xl" className="text-center font-bold text-typography-0" numberOfLines={1}>
        {name}
      </Text>

      <HStack space="sm" className="flex-wrap items-center justify-center">
        {/* Solid fill rather than a tint: white on primary-500 holds its contrast in either theme.
            No leading dot here — useStreakText already opens the label with its own glyph. */}
        <Chip className="border-primary-500 bg-primary-500" testID="profile-streak-chip">
          <Text size="xs" className="font-bold text-white">
            {streakText}
          </Text>
        </Chip>

        {!!memberSinceLabel && (
          <Chip className="border-outline-200 bg-background-200" testID="profile-member-since-chip">
            <Text size="xs" className="font-bold text-typography-100">
              {memberSinceLabel}
            </Text>
          </Chip>
        )}
      </HStack>
    </VStack>
  </>
);

export default ProfileIdentity;
