import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import SectionCard from '@gamelog/common/SectionCard';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import ChartErrorHandler from './ChartErrorHandler';

interface ChartCardProps {
  label?: string;
  isLoading: boolean;
  children: (layout: { cardWidth: number; theme: typeof rawConfig.light }) => React.ReactNode;
  error: boolean;
  ErrorBehaviour?: React.ComponentType;
  testID?: string;
}

const ThemeHandling = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  return theme;
};

const ChartWrapperCard = ({
  label,
  isLoading,
  children,
  error,
  ErrorBehaviour,
  testID,
}: ChartCardProps) => {
  const [cardWidth, setCardWidth] = useState(0);
  const theme = ThemeHandling();

  return (
    <Box className="w-full items-center">
      <SectionCard label={label} className="w-full" testID={testID}>
        <Box
          testID="card"
          className="w-full items-center"
          onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
        >
          {isLoading || (!error && cardWidth === 0) ? (
            <Spinner />
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
