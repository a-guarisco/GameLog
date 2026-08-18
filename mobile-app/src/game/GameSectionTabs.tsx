import { ReactNode, useState } from 'react';
import { Linking, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { formatShortDate, formatThousands } from '@gamelog/utils/formatUtils';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { useGetGameNews } from '@gamelog/api-manager/useApi';
import type { SteamNewsItem } from '@gamelog/api-manager/dto';
import { PLACEHOLDER_GUIDES, PLACEHOLDER_GUIDE_COUNT } from '@gamelog/game/gamePlaceholders';
import SeeAllLink from '@gamelog/game/SeeAllLink';

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

const SectionMessage = ({ children }: { children: string }) => (
  <Text size="xs" className="py-8 text-center text-typography-300">
    {children}
  </Text>
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
      {isLoadingGameNews && (
        <Box className="items-center py-8">
          <Spinner />
        </Box>
      )}

      {!isLoadingGameNews && errorGameNews && <SectionMessage>Could not load news</SectionMessage>}

      {!isLoadingGameNews && !errorGameNews && newsItems.length === 0 && (
        <SectionMessage>No news yet</SectionMessage>
      )}

      {newsItems.map((item, index) => (
        <NewsItemRow key={item.gid} item={item} isFirst={index === 0} />
      ))}

      <SectionLink label="See all news" url={`https://store.steampowered.com/news/app/${appid}`} />
    </VStack>
  );
};

const GuidesPanel = ({ appid }: { appid: string }) => (
  <VStack space="sm" className="pt-4">
    {PLACEHOLDER_GUIDES.map((guide) => (
      <HStack
        key={guide.id}
        space="md"
        className="rounded-xl border border-outline-100 bg-background-100 p-3 items-start"
      >
        <Box className="h-9 w-9 rounded-full bg-primary-500/20 border border-primary-400 items-center justify-center">
          <Text size="sm" className="font-bold text-primary-100">
            {guide.author.charAt(0).toUpperCase()}
          </Text>
        </Box>

        <VStack className="flex-1" space="xs">
          <Text size="sm" className="font-bold text-typography-0">
            {guide.title}
          </Text>
          <Text size="xs" className="text-typography-300">
            {guide.author} · {guide.authorGuideCount} guides
          </Text>
          <HStack space="md" className="items-center pt-0.5">
            <HStack space="xs" className="items-center">
              <Ionicons name="thumbs-up-outline" size={12} color="#8C8C8C" />
              <Text size="2xs" className="text-typography-300">
                {guide.votes}
              </Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <Ionicons name="time-outline" size={12} color="#8C8C8C" />
              <Text size="2xs" className="text-typography-300">
                {guide.readMinutes} min
              </Text>
            </HStack>
            <Box className="rounded-md bg-background-200 px-2 py-0.5">
              <Text size="2xs" className="font-bold text-typography-200">
                {guide.tag}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>
    ))}
    <SectionLink
      label={`See all ${formatThousands(PLACEHOLDER_GUIDE_COUNT)} guides`}
      url={`https://steamcommunity.com/app/${appid}/guides/`}
    />
  </VStack>
);

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
