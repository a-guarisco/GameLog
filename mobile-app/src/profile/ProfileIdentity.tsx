import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import Chip from '@gamelog/common/game/Chip';

interface ProfileIdentityProps {
  name: string;
  avatarUrl?: string;
  streakText: string;
  /** "Since 2011"; hidden when Steam does not report an account creation date. */
  memberSinceLabel?: string | null;
  /** Names the game whose artwork is behind the header. */
  mostPlayedName?: string;
}

/**
 * Avatar, name and status chips sitting under the header artwork. The avatar is pulled up with
 * a negative margin so it overlaps the banner the page renders behind the scroll view — the
 * same trick BannerInfo uses on the game views.
 */
const ProfileIdentity = ({
  name,
  avatarUrl,
  streakText,
  memberSinceLabel,
  mostPlayedName,
}: ProfileIdentityProps) => (
  <>
    {/*
      A zero-height rail, so the caption never takes layout space the avatar would then be
      pulled up through — the two used to collide mid-artwork. `bottom` clears the avatar's
      top edge, and the chip carries its own scrim because artwork can be bright anywhere.
    */}
    {!!mostPlayedName && (
      <Box className="h-0 w-full">
        <Box
          className="absolute bottom-11 left-4 right-4 flex-row justify-center"
          testID="profile-most-played-rail"
        >
          <Chip variant="tag" className="shrink bg-black/60" testID="profile-most-played">
            <Text
              size="2xs"
              className="font-bold uppercase text-white"
              style={{ letterSpacing: 1 }}
              numberOfLines={1}
            >
              Most played · {mostPlayedName}
            </Text>
          </Chip>
        </Box>
      </Box>
    )}

    <VStack space="sm" className="items-center bg-background-100 px-5 shadow-xl">
      <Avatar size="xl" className="-mt-9 border-4 border-background-100 bg-background-300">
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
