import { useMemo } from 'react';
import { RadarChart } from 'react-native-gifted-charts';
import { useGetGameGenreChartData } from '@gamelog/api-manager/useApi';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import ExternalLabelBox from '../ExternalLabelBox';

const USER_ID = '76561198077919169';

const GameGenreRadarChart = () => {
  const { genreChartData, isLoadingGenreChart, errorGenreChart } =
    useGetGameGenreChartData(USER_ID);

  const values = useMemo(() => genreChartData.map((d) => Number(d.value) || 0), [genreChartData]);

  const labels = useMemo(() => genreChartData.map((d) => d.label), [genreChartData]);

  return (
    <ChartWrapperCard isLoading={isLoadingGenreChart} error={errorGenreChart}>
      {({ theme }) => (
        <>
          <RadarChart
            data={values}
            labels={labels}
            maxValue={Math.max(...values)}
            noOfSections={5}
            dataLabelsPositionOffset={10}
          />

          <ExternalLabelBox
            graphData={genreChartData.map((item) => ({
              ...item,
              lamdaFormatLabel: (text: string) => formatMinutesToHours(parseInt(text)),
            }))}
            theme={theme}
          />
        </>
      )}
    </ChartWrapperCard>
  );
};

export default GameGenreRadarChart;
