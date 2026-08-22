import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Card } from '@gamelog/common/gluestack/card';
import { Box } from '@gamelog/common/gluestack/box';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import ChartErrorHandler from './ChartErrorHandler';

interface ChartCardProps {
  label?: string;
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

const ChartWrapperCard = ({ label, isLoading, children, error, ErrorBehaviour }: ChartCardProps) => {
  const [cardWidth, setCardWidth] = useState(0);
  const theme = ThemeHandling();

  return (
    <Box className="w-full items-center">
      <Card
        variant="elevated"
        className="w-full py-4"
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      >
        <VStack space="sm" className="w-full">
          {!!label && (
            <Text
              size="2xs"
              className="font-bold uppercase text-typography-300 px-4"
              style={{ letterSpacing: 1 }}
            >
              {label}
            </Text>
          )}
          <Box className="w-full items-center">
            {isLoading || (!error && cardWidth === 0) ? (
              <Spinner />
            ) : error ? (
              <ChartErrorHandler ErrorBehaviour={ErrorBehaviour} />
            ) : (
              children({ cardWidth, theme })
            )}
          </Box>
        </VStack>
      </Card>
    </Box>
  );
};

export default ChartWrapperCard;
