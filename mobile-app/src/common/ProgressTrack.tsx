import { Box } from '@gamelog/common/gluestack/box';
import { StyleProp, ViewStyle } from 'react-native';

interface ProgressTrackProps {
  percent: number;
  className?: string;
  fillClassName?: string;
  fillStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const ProgressTrack = ({
  percent,
  className = '',
  fillClassName = 'bg-primary-500',
  testID,
  fillStyle,
}: ProgressTrackProps) => (
  <Box
    className={`h-2.5 w-full   overflow-hidden rounded-full bg-background-200 dark:bg-background-300 border border-outline-100/40 dark:border-outline-50/20 ${className}`}
  >
    <Box
      testID={testID}
      className={`h-full rounded-full ${fillClassName}`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </Box>
);

export default ProgressTrack;
