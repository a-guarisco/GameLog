import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';

type StatRowProps = {
  label: string;
  value: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export const GameStatRow = ({
  label,
  value,
  className = 'w-1/2',
  labelClassName = 'font-extralight text-typography-200',
  valueClassName = 'text-typography-200',
}: StatRowProps) => (
  <Box className={className}>
    <Text className={labelClassName}>
      {label}: <Text className={valueClassName}>{value}</Text>
    </Text>
  </Box>
);
