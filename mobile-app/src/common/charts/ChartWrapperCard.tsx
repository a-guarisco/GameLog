import { useState, ReactNode, ComponentType } from 'react';
import { useColorScheme, ViewStyle } from 'react-native';
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
  style?: ViewStyle;
}

const useChartTheme = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  return theme;
};

const ChartWrapperCard = ({
  label,
  headerRight,
  isLoading,
  children,
  error,
  ErrorBehaviour,
  testID,
  style,
}: ChartCardProps) => {
  // Per-instance measured width — not shared. This ensures re-layout on rotation
  // is always picked up; each card measures its own container independently.
  const [cardWidth, setCardWidth] = useState(0);
  const theme = useChartTheme();

  const isStretched = Boolean(
    style && ('height' in (style as any) || 'minHeight' in (style as any) || (style as any).flex)
  );

  const hasFlex = Boolean(style && (style as any).flex);

  return (
    <Box className={`w-full items-center ${hasFlex ? 'flex-1 h-full' : ''}`} style={style}>
      <SectionCard
        label={label}
        headerRight={headerRight}
        className={`w-full ${isStretched ? 'h-full flex-1' : ''}`}
        testID={testID}
      >
        <Box
          testID="card"
          className={`w-full items-center ${isStretched ? 'h-full flex-1 justify-center' : ''}`}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            // Always update on every layout event so rotation re-measures correctly.
            if (width > 0 && width !== cardWidth) {
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
