import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';

import apiManager from '@gamelog/api-manager/apiManager';
import { OwnedGames } from '@gamelog/api-manager/dto';

import { Spinner } from '@gamelog/components/ui/spinner';
import { Card } from '@gamelog/components/ui/card';
import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';

import { brand } from '@gamelog/theme/theme';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';

const TOP_GAMES_TO_FETCH = 15;
const TOP_GENRES_TO_SHOW = 8;

interface GenreData {
  label: string;
  value: number;
}

const fetchGenresForAppId = async (appid: string): Promise<string[]> => {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=genres`
    );
    const json = await res.json();
    const data = json[appid];
    if (!data?.success) return [];
    return (data.data?.genres ?? []).map((g: { description: string }) => g.description);
  } catch {
    return [];
  }
};

const buildGenreData = async (games: OwnedGames['response']['games']): Promise<GenreData[]> => {
  const top = [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, TOP_GAMES_TO_FETCH);

  const genreMinutes: Record<string, number> = {};

  await Promise.all(
    top.map(async (game) => {
      const genres = await fetchGenresForAppId(String(game.appid));
      genres.forEach((genre) => {
        genreMinutes[genre] = (genreMinutes[genre] ?? 0) + game.playtime_forever;
      });
    })
  );

  return Object.entries(genreMinutes)
    .map(([genre, minutes]) => ({
      label: genre,
      value: minutes,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_GENRES_TO_SHOW);
};

const formatMinutes = (m: number) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
};

const GenreRadarChart = () => {
  const [data, setData] = useState<GenreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('76561198159652025');

  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  useEffect(() => {
    apiManager
      .getOwnedGames(userId, false)
      .then(async (response: OwnedGames) => {
        const genreData = await buildGenreData(response.response.games);
        setData(genreData);
        setIsLoading(false);
      })
      .catch((error) => console.error('Error building genre data:', error));
  }, [userId]);

  const values = data.map((d) => d.value);
  const labels = data.map((d) => d.label);

  return (
    <Box style={{ width: '95%', alignItems: 'center' }}>
      <Card
        style={{ backgroundColor: `rgb(${theme['--color-background-100']})` }}
        className="w-full rounded-lg items-center py-4"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <RadarChart
              data={values}
              labels={labels}
              maxValue={Math.max(...values)}
              noOfSections={5}
              labelsPositionOffset={10}
              isAnimated
              animationDuration={600}
            />

            <Box
              style={{
                width: '90%',
                height: 1,
                backgroundColor: `rgb(${theme['--color-background-300']})`,
                marginVertical: 12,
              }}
            />

            <Box style={{ width: '90%', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {data.map((item) => (
                <Box
                  key={item.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' }}
                >
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: `rgb(${brand.info['500']})`,
                    }}
                  />
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: `rgb(${theme['--color-typography-400']})`,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        color: `rgb(${theme['--color-typography-200']})`,
                        fontSize: 10,
                      }}
                    >
                      {formatMinutes(item.value)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default GenreRadarChart;
