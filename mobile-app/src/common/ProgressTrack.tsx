import { Box } from '@gamelog/common/gluestack/box';

interface ProgressTrackProps {
  /** 0–100; values outside the range are clamped so the fill can never overflow the track. */
  percent: number;
  /** Track sizing/colour overrides, e.g. "h-2". */
  className?: string;
  fillClassName?: string;
  testID?: string;
}

/** Slim rounded progress bar shared by the game and profile sections. */
const ProgressTrack = ({
  percent,
  className = '',
  fillClassName = 'bg-primary-400',
  testID,
}: ProgressTrackProps) => (
  <Box className={`h-1.5 w-full overflow-hidden rounded-full bg-background-200 ${className}`}>
    <Box
      testID={testID}
      className={`h-full rounded-full ${fillClassName}`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </Box>
);

export default ProgressTrack;
