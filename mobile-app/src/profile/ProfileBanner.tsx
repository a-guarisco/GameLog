import { useMemo, useCallback } from 'react';
import { Linking, Pressable } from 'react-native';
import { VStack } from '../common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { Text } from '@gamelog/common/gluestack/text';
import Banner from '@gamelog/common/Banner';
import BannerInfo from '@gamelog/common/BannerInfo';

interface ProfileBannerProps {
  userId: string;
  ownedGames?: any;
  playersInfo?: any;
}

const TEMP_APPID = '236390';
const FALLBACK_URL = 'https://steamcommunity.com/';

export default function ProfileBanner({ userId, ownedGames, playersInfo }: ProfileBannerProps) {
  const player = playersInfo?.response?.players?.[0];

  const gameHeaderImage = useMemo(() => {
    const appId = ownedGames?.response?.games?.[0]?.appid ?? TEMP_APPID;
    return steamAssetUrls.getGameHeaderImage(appId);
  }, [ownedGames]);

  const openSteamProfile = useCallback(() => {
    if (!player?.profileurl) {
      Linking.openURL(FALLBACK_URL);
      return;
    }

    Linking.openURL(player.profileurl);
  }, [player?.profileurl]);

  if (!playersInfo) {
    return (
      <Text className="text-error-500 mb-4 text-center">
        Failed to load profile, please try again later.
      </Text>
    );
  }

  return (
    <Pressable onPress={openSteamProfile} className="w-full">
      <VStack className="w-full bg-background-100 rounded-b-2xl shadow-lg border-b border-outline-100 overflow-hidden">
        <Box className="overflow-hidden">
          <Banner imageUrl={gameHeaderImage} minHeight={140} heightPercentage={18} />
        </Box>

        <BannerInfo
          title={player?.personaname ?? 'Unknown User'}
          secondaryText="🔥 10 day streak"
          iconUrl={player?.avatarfull}
        />
      </VStack>
    </Pressable>
  );
}
