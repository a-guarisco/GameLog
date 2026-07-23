import { useMemo } from 'react';
import { RadarChart } from 'react-native-gifted-charts';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import ExternalLabelBox from '../ExternalLabelBox';
interface GameGenreRadarChartProps {
  genreChartData?: any[];
  isLoadingGenreChart?: boolean;
  errorGenreChart?: any;
}

const GameGenreRadarChart = ({
  genreChartData = [],
  isLoadingGenreChart = false,
  errorGenreChart,
}: GameGenreRadarChartProps) => {

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
