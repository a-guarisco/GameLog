import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { useGetOwnedGames, useGetGameGenreChartData } from '@gamelog/api-manager/useApi';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import ProfileBanner from '@gamelog/profile/ProfileBanner';
import ProfileStats from './ProfileStats';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';

const USER_ID = '76561198077919169';

const ProfileView = () => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(USER_ID, false);
  const { genreChartData, isLoadingGenreChart, errorGenreChart } =
    useGetGameGenreChartData(USER_ID);

  const isLoadingContent = isLoadingOwnedGames || isLoadingGenreChart;

  const chartComponents = useMemo(() => {
    if (isLoadingContent) {
      return [
        <Box
          key="content-spinner"
          style={{ width: '100%', alignItems: 'center', paddingVertical: 40 }}
        >
          <Spinner size="large" testID="content-spinner" />
        </Box>,
      ];
    }

    return [
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
    ];
  }, [isLoadingContent, ownedGames, genreChartData, errorOwnedGames, errorGenreChart]);

  return (
    <Box>
      <FlatList
        data={chartComponents}
        renderItem={({ item }) => (
          <Box style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>{item}</Box>
        )}
        keyExtractor={(item, index) => item.key ?? `${index}`}
        ListHeaderComponent={<ProfileBanner userId={USER_ID} ownedGames={ownedGames} />}
      />
    </Box>
  );
};

export default ProfileView;
