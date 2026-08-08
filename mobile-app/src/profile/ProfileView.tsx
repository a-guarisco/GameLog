import { useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox } from '@gamelog/common/feedbacks/LoadingBox';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import BannerInfo from '@gamelog/common/BannerInfo';
import ProfileStats from './ProfileStats';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';

const USER_ID = '76561198077919169';
const TEMP_APPID = '236390';

const ProfileView = () => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(
    USER_ID,
    false,
    false
  );
  const { genreChartData, isLoadingGenreChart, errorGenreChart } = useGetGameGenreChartData(
    USER_ID,
    false,
    false
  );
  const { playersInfo, isLoadingPlayersInfo } = useGetPlayersInfo(useMemo(() => [USER_ID], []));
  const { userStreak, isLoadingUserStreak } = useGetUserStreak();
  const isLoading =
    isLoadingOwnedGames || isLoadingGenreChart || isLoadingPlayersInfo || isLoadingUserStreak;
  const player = playersInfo?.response?.players?.[0];

  const streakText = (() => {
    if (isLoadingUserStreak) return 'Loading streak...';
    const streak = userStreak?.streak ?? 0;
    return streak > 0 ? `🔥 ${streak} day streak` : '0 day streak';
  })();

  const chartComponents = useMemo(
    () => [
      <BannerInfo
        key="BannerInfo"
        className="bg-background-100 shadow-xl"
        title={player?.personaname ?? 'Unknown User'}
        secondaryText={streakText}
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
    [ownedGames, genreChartData, errorOwnedGames, errorGenreChart, player, streakText]
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
      <ScrollablePage>
        {chartComponents.map((item) => (
          <Box
            key={item.key}
            style={{ width: '100%', alignItems: 'center' }}
            className="bg-background-100"
          >
            {item}
          </Box>
        ))}
      </ScrollablePage>
    </Box>
  );
};

export default ProfileView;
