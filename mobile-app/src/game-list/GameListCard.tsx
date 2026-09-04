import { useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Image } from '@gamelog/common/gluestack/image';
import { Card } from '@gamelog/common/gluestack/card';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { PLATFORMS } from '@gamelog/common/charts/platform-split/selectPlatformSplit';
import { GameListItemData, SortBy, PlatformFilter } from './useGameList';
import Ionicons from '@react-native-vector-icons/ionicons';
import { GameListCardBadges } from './GameListCardBadges';
import { GameListCardExpandedDetails } from './GameListCardExpandedDetails';
import { useOrientation } from '@gamelog/common/useOrientation';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

interface GameListCardProps {
  gameItem: GameListItemData;
  sortBy: SortBy;
  platformFilter: PlatformFilter;
  onPress?: () => void;
}

export const GameListCard = ({ gameItem, sortBy, platformFilter, onPress }: GameListCardProps) => {
  const { isTablet } = useOrientation();
  const [isExpanded, setIsExpanded] = useState(false);
  const headerUrl = steamAssetUrls.getGameHeaderImage(gameItem.appid);
  const logoUrl = steamAssetUrls.getGameClearLogoImage(gameItem.appid);
  const [imageState, setImageState] = useState<'header' | 'logo' | 'fallback'>('header');

  const platforms = PLATFORMS.map((p) => ({
    name: p.name,
    time: (gameItem[p.field] as number) || 0,
    iconName: p.icon,
  }));
  const topPlatform = platforms.reduce(
    (prev, curr) => (curr.time > prev.time ? curr : prev),
    platforms[0]
  );

  const lastPlayedDate = gameItem.rtime_last_played * 1000;
  const daysAgo = Math.floor((Date.now() - lastPlayedDate) / 86400000);
  let lastPlayedText = '';
  if (daysAgo === 0) {
    lastPlayedText = 'Today';
  } else if (daysAgo < 7) {
    lastPlayedText = `${daysAgo}d`;
  } else if (daysAgo < 30) {
    lastPlayedText = `${Math.floor(daysAgo / 7)}W`;
  } else if (daysAgo < 365) {
    lastPlayedText = `${Math.floor(daysAgo / 30)}M`;
  } else {
    lastPlayedText = `${Math.floor(daysAgo / 365)}Y`;
  }

  const exactDateString = new Date(lastPlayedDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card variant="elevated" className="m-1 overflow-hidden p-0">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        testID={`game-list-card-press-${gameItem.appid}`}
      >
        <Box
          className={`bg-background-100 items-center justify-center overflow-hidden w-full ${isTablet ? 'h-36' : 'h-24'}`}
        >
          {imageState === 'header' ? (
            <Image
              source={headerUrl}
              alt={`${gameItem.name} header`}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImageState('logo')}
            />
          ) : imageState === 'logo' ? (
            <Image
              source={logoUrl}
              alt={`${gameItem.name} logo`}
              className="w-3/4 h-3/4"
              resizeMode="contain"
              onError={() => setImageState('fallback')}
            />
          ) : (
            <Text className="text-typography-300 font-bold text-center px-4" numberOfLines={2}>
              {gameItem.name}
            </Text>
          )}
        </Box>
        <VStack className="p-2 bg-background-50" space="sm">
          <GameListCardBadges
            gameItem={gameItem}
            topPlatform={topPlatform}
            lastPlayedText={lastPlayedText}
            isExpanded={isExpanded}
            sortBy={sortBy}
            platformFilter={platformFilter}
          />
        </VStack>
      </Pressable>

      {/* Expand Toggle */}
      <Pressable
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        testID={`game-list-card-expand-${gameItem.appid}`}
        className="py-1.5 items-center justify-center bg-background-50 active:bg-background-100"
      >
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={HEX_COLORS.muted.icon.hex}
        />
      </Pressable>

      {/* Expanded Details */}
      {isExpanded && (
        <GameListCardExpandedDetails
          gameItem={gameItem}
          exactDateString={exactDateString}
          platforms={platforms}
          lastPlayedText={lastPlayedText}
        />
      )}
    </Card>
  );
};
