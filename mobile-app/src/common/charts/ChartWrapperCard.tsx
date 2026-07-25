import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Card } from '@gamelog/common/gluestack/card';
import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import ChartErrorHandler from './ChartErrorHandler';

interface ChartCardProps {
  isLoading: boolean;
  children: (layout: { cardWidth: number; theme: typeof rawConfig.light }) => React.ReactNode;
  error: boolean;
  ErrorBehaviour?: React.ComponentType;
}

const ThemeHandling = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  return theme;
};

const ChartWrapperCard = ({ isLoading, children, error, ErrorBehaviour }: ChartCardProps) => {
  const [cardWidth, setCardWidth] = useState(0);
  const theme = ThemeHandling();

  return (
    <Box style={{ width: '95%', alignItems: 'center', overflow: 'hidden' }}>
      <Card
        style={{ backgroundColor: `rgb(${theme['--color-background-100']})` }}
        className="w-full rounded-lg items-center py-4"
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        {isLoading || (!error && cardWidth === 0) ? (
          <Spinner />
        ) : error ? (
          <ChartErrorHandler ErrorBehaviour={ErrorBehaviour} />
        ) : (
          children({ cardWidth, theme })
        )}
      </Card>
    </Box>
  );
};

export default ChartWrapperCard;
