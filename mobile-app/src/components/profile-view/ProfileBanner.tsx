import { useMemo, useCallback } from 'react';
import { Linking, Pressable } from 'react-native';
import { VStack } from '../ui/vstack';
import { useGetOwnedGames, useGetPlayersInfo } from '@gamelog/api-manager/useApi';
import apiEndsPoints from '@gamelog/api-manager/apiEndsPoints';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Text } from '@gamelog/components/ui/text';
import Banner from '@gamelog/common/Banner';
import BannerInfo from '@gamelog/common/BannerInfo';
interface ProfileBannerProps {
  userId: string;
}

const TEMP_APPID = '236390';
const FALLBACK_URL = 'https://steamcommunity.com/';

export default function ProfileBanner({ userId }: ProfileBannerProps) {
  const userIds = useMemo(() => [userId], [userId]);
  const { ownedGames } = useGetOwnedGames('76561198077919169', false);
  const { playersInfo, isLoadingPlayersInfo, errorPlayersInfo } = useGetPlayersInfo(userIds);
  const player = playersInfo?.response?.players?.[0];

  const gameHeaderImage = useMemo(() => {
    const appId = ownedGames?.response?.games?.[0]?.appid ?? TEMP_APPID;
    return apiEndsPoints.GET_GAME_HEADER_IMAGE(appId);
  }, [ownedGames]);

  const openSteamProfile = useCallback(() => {
    if (!player?.profileurl) {
      Linking.openURL(FALLBACK_URL);
      return;
    }

    Linking.openURL(player.profileurl);
  }, [player?.profileurl]);

  if (isLoadingPlayersInfo) {
    return <Spinner size="large" />;
  }

  if (errorPlayersInfo) {
    return (
      <Text className="text-error-500 mb-4 text-center">
        Failed to load profile, please try again later.
      </Text>
    );
  }
  
  return (
    <Pressable onPress={openSteamProfile} className="w-full">
      <VStack className="w-full">
        <Banner imageUrl={gameHeaderImage} minHeight={150} heightPercentage={20} className='opacity-50' />

        <BannerInfo
          title={player?.personaname ?? 'Unknown User'}
          secondaryText="🔥 10 streak"
          iconUrl={player?.avatarfull}
          className="h-100"
        />
      </VStack>
    </Pressable>
  );
}
