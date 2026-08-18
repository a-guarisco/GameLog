import { ReactNode, useState } from 'react';
import { Linking, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { formatShortDate, formatThousands } from '@gamelog/utils/formatUtils';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { useGetGameGuides, useGetGameNews } from '@gamelog/api-manager/useApi';
import type { PublishedFileDetails, SteamNewsItem } from '@gamelog/api-manager/dto';
import { getGuideTopicTags, getGuideUrl } from '@gamelog/game/guideTags';
import SeeAllLink from '@gamelog/common/SeeAllLink';
import SectionState from '@gamelog/common/SectionState';
import Chip from '@gamelog/common/Chip';

type SectionId = 'achievements' | 'news' | 'guides';

const TABS: { id: SectionId; label: string }[] = [
  { id: 'achievements', label: 'Achievements' },
  { id: 'news', label: 'News' },
  { id: 'guides', label: 'Guides' },
];

const openExternalUrl = (url: string) => {
  Linking.openURL(url).catch((error) => console.warn(`Could not open ${url}`, error));
};

const SectionLink = ({ label, url }: { label: string; url: string }) => (
  <SeeAllLink label={label} onPress={() => openExternalUrl(url)} />
);

/** Steam fills `author` with an email or nothing on syndicated feeds; the feed name reads better there. */
const getNewsByline = ({ author, feedlabel }: SteamNewsItem) =>
  author && !author.includes('@') ? author : feedlabel;

const NewsItemRow = ({ item, isFirst }: { item: SteamNewsItem; isFirst: boolean }) => (
  <Pressable
    onPress={() => openExternalUrl(item.url)}
    accessibilityRole="link"
    accessibilityLabel={item.title}
    testID={`news-item-${item.gid}`}
    className={`py-4 ${isFirst ? '' : 'border-t border-outline-100'}`}
  >
    <VStack space="xs">
      <HStack space="sm" className="items-center">
        <Text
          size="2xs"
          className="shrink font-bold uppercase text-typography-300"
          style={{ letterSpacing: 1 }}
          numberOfLines={1}
        >
          {getNewsByline(item)}
        </Text>
        <Text size="2xs" className="text-typography-400">
          {formatShortDate(item.date)}
        </Text>
      </HStack>
      <Text size="md" className="font-bold text-typography-0">
        {item.title}
      </Text>
    </VStack>
  </Pressable>
);

const NewsPanel = ({ appid }: { appid: string }) => {
  const { gameNews, isLoadingGameNews, errorGameNews } = useGetGameNews(appid);
  const newsItems = gameNews?.appnews?.newsitems ?? [];

  return (
    <VStack>
      <SectionState
        isLoading={isLoadingGameNews}
        hasError={!!errorGameNews}
        isEmpty={newsItems.length === 0}
        errorMessage="Could not load news"
        emptyMessage="No news yet"
      />

      {newsItems.map((item, index) => (
        <NewsItemRow key={item.gid} item={item} isFirst={index === 0} />
      ))}

      <SectionLink label="See all news" url={`https://store.steampowered.com/news/app/${appid}`} />
    </VStack>
  );
};

const GuideStat = ({
  icon,
  value,
}: {
  icon: 'eye-outline' | 'star-outline' | 'chatbubble-outline';
  value: number;
}) => (
  <HStack space="xs" className="items-center">
    <Ionicons name={icon} size={12} color="#8C8C8C" />
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

const GuidesPanel = ({ appid }: { appid: string }) => {
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

      <SectionLink
        label={
          totalGuides > 0 ? `See all ${formatThousands(totalGuides)} guides` : 'See all guides'
        }
        url={`https://steamcommunity.com/app/${appid}/guides/`}
      />
    </VStack>
  );
};

interface GameSectionTabsProps {
  appid: string;
  /** Rendered under the Achievements tab, so the existing achievement rows stay untouched. */
  achievementsSlot: ReactNode;
}

const GameSectionTabs = ({ appid, achievementsSlot }: GameSectionTabsProps) => {
  const [activeTab, setActiveTab] = useState<SectionId>('achievements');

  return (
    <Box>
      <HStack className="border-b border-outline-100">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              testID={`game-tab-${tab.id}`}
              className="flex-1 h-11 items-center justify-center"
            >
              <Text
                size="sm"
                className={
                  isActive ? 'font-bold text-primary-300' : 'font-medium text-typography-300'
                }
              >
                {tab.label}
              </Text>
              {isActive && (
                <Box className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
              )}
            </Pressable>
          );
        })}
      </HStack>

      {activeTab === 'achievements' && <Box className="pt-4">{achievementsSlot}</Box>}
      {activeTab === 'news' && <NewsPanel appid={appid} />}
      {activeTab === 'guides' && <GuidesPanel appid={appid} />}
    </Box>
  );
};

export default GameSectionTabs;
