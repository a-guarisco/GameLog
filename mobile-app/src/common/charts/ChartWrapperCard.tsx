import { useState, ReactNode, ComponentType } from 'react';
import { useColorScheme } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import SectionCard from '@gamelog/common/SectionCard';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import ChartErrorHandler from './ChartErrorHandler';

interface ChartCardProps {
  label?: string;
  headerRight?: ReactNode;
  isLoading: boolean;
  children: (layout: { cardWidth: number; theme: typeof rawConfig.light }) => ReactNode;
  error: boolean;
  ErrorBehaviour?: ComponentType;
  testID?: string;
}

const useChartTheme = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  return theme;
};

// Cache the measured width so subsequent charts on the same screen (e.g. switching tabs)
// can render immediately without waiting for onLayout and flashing a spinner.
let sharedChartWidth = 0;

const ChartWrapperCard = ({
  label,
  headerRight,
  isLoading,
  children,
  error,
  ErrorBehaviour,
  testID,
}: ChartCardProps) => {
  const [cardWidth, setCardWidth] = useState(sharedChartWidth);
  const theme = useChartTheme();

  return (
    <Box className="w-full items-center">
      <SectionCard label={label} headerRight={headerRight} className="w-full" testID={testID}>
        <Box
          testID="card"
          className="w-full items-center"
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            if (width > 0 && width !== sharedChartWidth) {
              sharedChartWidth = width;
            }
            if (width !== cardWidth) {
              setCardWidth(width);
            }
          }}
        >
          {isLoading || (!error && cardWidth === 0) ? (
            <Spinner className="my-8" testID="spinner" />
          ) : error ? (
            <ChartErrorHandler ErrorBehaviour={ErrorBehaviour} />
          ) : (
            children({ cardWidth, theme })
          )}
        </Box>
      </SectionCard>
    </Box>
  );
};

export default ChartWrapperCard;
