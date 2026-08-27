import { VStack } from '@gamelog/common/gluestack/vstack';
import { StatValueText, StatLabelText } from '@gamelog/common/typography/CardTypography';

export interface StatBlockProps {
  value: string;
  label: string;
  valueClassName?: string;
  isOnCard?: boolean;
}

/** A single stat cell (value + label). Reused across profile banner, report summary, etc. */
const StatBlock = ({ value, label, valueClassName = '', isOnCard = false }: StatBlockProps) => (
  <VStack
    className="flex-1 justify-between px-3 py-3 items-center"
    space="xs"
  >
    <StatLabelText className="text-center">{label}</StatLabelText>
    <StatValueText className={`text-center ${valueClassName}`}>{value}</StatValueText>
  </VStack>
);

export default StatBlock;
