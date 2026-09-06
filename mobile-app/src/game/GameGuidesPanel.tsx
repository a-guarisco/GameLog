import { Linking, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { useGetGameGuides } from '@gamelog/api-manager/useApi';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';
import { getGuideTopicTags, getGuideUrl } from '@gamelog/game/guideTags';
import GoToLink from '@gamelog/common/GoToLink';
import SectionState from '@gamelog/common/SectionState';
import Chip from '@gamelog/common/Chip';
import { formatThousands } from '@gamelog/utils/formatUtils';
import { HEX_COLORS } from '@gamelog/theme/hexColors';


const openExternalUrl = (url: string) => {
  Linking.openURL(url).catch((error) => console.warn(`Could not open ${url}`, error));
};

const GuideStat = ({
  icon,
  value,
}: {
  icon: 'eye-outline' | 'star-outline' | 'chatbubble-outline';
  value: number;
}) => (
  <HStack space="xs" className="items-center">
    <Ionicons name={icon} size={12} color={HEX_COLORS.muted.icon.hex} />
    <Text size="2xs" className="text-typography-300">
      {formatThousands(value)}
    </Text>
  </HStack>
);

const GuideCard = ({ guide }: { guide: PublishedFileDetails }) => (
  <Pressable
    onPress={() => openExternalUrl(getGuideUrl(guide.publishedfileid))}
    accessibilityRole="link"
    accessibilityLabel={guide.title}
    testID={`guide-item-${guide.publishedfileid}`}
    className="rounded-xl border border-outline-100 bg-background-200 p-3"
  >
    <VStack space="xs">
      <Text size="sm" className="font-bold text-typography-0">
        {guide.title}
      </Text>

      {!!guide.short_description && (
        <Text size="xs" className="leading-5 text-typography-300" numberOfLines={2}>
          {guide.short_description}
        </Text>
      )}

      <HStack space="xs" className="flex-wrap items-center pt-0.5">
        {getGuideTopicTags(guide).map((tag) => (
          <Chip key={tag} variant="tag" className="bg-background-300">
            <Text size="2xs" className="font-bold text-typography-200">
              {tag}
            </Text>
          </Chip>
        ))}
      </HStack>

      <HStack space="md" className="items-center pt-0.5">
        <GuideStat icon="eye-outline" value={guide.views ?? 0} />
        <GuideStat icon="star-outline" value={guide.lifetime_favorited ?? 0} />
        <GuideStat icon="chatbubble-outline" value={guide.num_comments_public ?? 0} />
      </HStack>
    </VStack>
  </Pressable>
);

interface GameGuidesPanelProps {
  appid: string;
}

const GameGuidesPanel = ({ appid }: GameGuidesPanelProps) => {
  const { gameGuides, isLoadingGameGuides, errorGameGuides } = useGetGameGuides(appid);
  const guides = gameGuides?.response?.publishedfiledetails ?? [];
  const totalGuides = gameGuides?.response?.total ?? 0;

  return (
    <VStack space="sm" className="pt-4">
      <SectionState
        isLoading={isLoadingGameGuides}
        hasError={!!errorGameGuides}
        isEmpty={guides.length === 0}
        errorMessage="Could not load guides"
        emptyMessage="No guides yet"
      />

      {guides.map((guide) => (
        <GuideCard key={guide.publishedfileid} guide={guide} />
      ))}

      <GoToLink
        label="See all guides on Steam"
        onPress={() => openExternalUrl(`https://steamcommunity.com/app/${appid}/guides/`)}
      />
    </VStack>
  );
};

export default GameGuidesPanel;
