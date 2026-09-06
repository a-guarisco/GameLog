import { VStack } from '@gamelog/common/gluestack/vstack';
import { StatValueText, StatLabelText } from '@gamelog/common/typography/CardTypography';

import { Box } from '@gamelog/common/gluestack/box';

export interface StatBlockProps {
  value: string;
  label: string;
  valueClassName?: string;
  isOnCard?: boolean;
  isLandscape?: boolean;
}

/** A single stat cell (value + label). Reused across profile banner, report summary, etc. */
const StatBlock = ({
  value,
  label,
  valueClassName = '',
  isOnCard = false,
  isLandscape = false,
}: StatBlockProps) => {
  if (isLandscape) {
    return (
      <VStack className="flex-1 px-1 py-2.5 items-center justify-between min-h-[96px]" space="xs">
        <Box className="w-full min-h-[42px] items-center justify-center">
          <StatLabelText
            className="text-center"
            numberOfLines={2}
            style={{ letterSpacing: 0.5, lineHeight: 14 }}
          >
            {label}
          </StatLabelText>
        </Box>
        <Box className="flex-1 w-full items-center justify-center">
          <StatValueText className={`text-center ${valueClassName}`} numberOfLines={2}>
            {value}
          </StatValueText>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 justify-between px-3 py-3 items-center" space="xs">
      <StatLabelText className="text-center">{label}</StatLabelText>
      <StatValueText className={`text-center ${valueClassName}`}>{value}</StatValueText>
    </VStack>
  );
};

export default StatBlock;
