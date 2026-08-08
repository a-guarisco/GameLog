import { useMemo } from 'react';
import { Animated, useColorScheme } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox } from '@gamelog/common/feedbacks/LoadingBox';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
} from '@gamelog/api-manager/useApi';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import BannerInfo from '@gamelog/common/BannerInfo';
import ProfileStats from './ProfileStats';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import useTopNotchBlurOverlay from '@gamelog/common/useTopNotchBlurOverlay';
import TopNotchBlurOverlay from '@gamelog/common/TopNotchBlurOverlay';

const USER_ID = '76561198077919169';
const TEMP_APPID = '236390';

const ProfileView = () => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(USER_ID, false);
  const { genreChartData, isLoadingGenreChart, errorGenreChart } =
    useGetGameGenreChartData(USER_ID);
  const { playersInfo, isLoadingPlayersInfo } = useGetPlayersInfo(useMemo(() => [USER_ID], []));
  const isLoading = isLoadingOwnedGames || isLoadingGenreChart || isLoadingPlayersInfo;
  const player = playersInfo?.response?.players?.[0];

  const isDark = useColorScheme() === 'dark';
  const { bannerHeight, insetsTop, notchBlurOpacity, onScroll, scrollBlurTargetRef } =
    useTopNotchBlurOverlay();

  const chartComponents = useMemo(
    () => [
      <BannerInfo
        key="BannerInfo"
        className="bg-background-100 shadow-xl"
        title={player?.personaname ?? 'Unknown User'}
        secondaryText="🔥 10 day streak"
        iconUrl={player?.avatarfull}
      />,
      <ProfileStats key="ProfileStats" />,
      <TotalHoursChart
        key="TotalHoursChart"
        ownedGames={ownedGames}
        isLoadingOwnedGames={false}
        errorOwnedGames={errorOwnedGames}
      />,
      <TotalHoursPieChart
        key="TotalHoursPieChart"
        ownedGames={ownedGames}
        isLoadingOwnedGames={false}
        errorOwnedGames={errorOwnedGames}
      />,
      <GameGenreRadarChart
        key="GameGenreRadarChart"
        genreChartData={genreChartData}
        isLoadingGenreChart={false}
        errorGenreChart={errorGenreChart}
      />,
      <OsShareChart
        key="OsShareChart"
        ownedGames={ownedGames}
        isLoadingOwnedGames={false}
        errorOwnedGames={errorOwnedGames}
      />,
    ],
    [ownedGames, genreChartData, errorOwnedGames, errorGenreChart, player]
  );

  if (isLoading) {
    return (
      <LoadingBox
        message="Loading Profile"
        testID="profile-loading-box"
        style={{ flex: 1, paddingVertical: 60 }}
      />
    );
  }

  return (
    <Box className="flex-1 relative">
      <HeaderGameImage appid={TEMP_APPID} />

      <BlurTargetView ref={scrollBlurTargetRef} className="absolute inset-0 z-40">
        <Animated.ScrollView
          contentContainerStyle={{
            paddingTop: bannerHeight,
            paddingHorizontal: 0,
            paddingBottom: 24,
          }}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {chartComponents.map((item) => (
            <Box
              key={item.key}
              style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}
              className="bg-background-100"
            >
              {item}
            </Box>
          ))}
        </Animated.ScrollView>
      </BlurTargetView>

      <TopNotchBlurOverlay
        blurTargetRef={scrollBlurTargetRef}
        height={insetsTop}
        opacity={notchBlurOpacity}
        isDark={isDark}
      />
    </Box>
  );
};

export default ProfileView;
