import { Linking, Pressable } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { useGetGameNews } from '@gamelog/api-manager/useApi';
import type { SteamNewsItem } from '@gamelog/api-manager/dto';
import GoToLink from '@gamelog/common/GoToLink';
import SectionState from '@gamelog/common/SectionState';
import { formatShortDate } from '@gamelog/utils/formatUtils';

const openExternalUrl = (url: string) => {
  Linking.openURL(url).catch((error) => console.warn(`Could not open ${url}`, error));
};

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

interface GameNewsPanelProps {
  appid: string;
}

const GameNewsPanel = ({ appid }: GameNewsPanelProps) => {
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

      <GoToLink
        label="See all news on Steam"
        onPress={() => openExternalUrl(`https://store.steampowered.com/news/app/${appid}`)}
        testID="see-all-news-button"
      />
    </VStack>
  );
};

export default GameNewsPanel;
