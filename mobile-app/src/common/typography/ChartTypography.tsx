import { Text } from '@gamelog/common/gluestack/text';

export const ChartSummaryText = ({ children, className = '', ...props }: any) => (
  <Text size="xl" className={`font-bold text-typography-0 ${className}`} {...props}>
    {children}
  </Text>
);

export const ChartDeltaText = ({
  children,
  className = '',
  isPositive,
  isNeutral,
  ...props
}: any) => {
  let colorClass = 'text-typography-300';
  if (isNeutral) {
    colorClass = 'text-typography-400';
  } else if (isPositive !== undefined) {
    colorClass = isPositive ? 'text-success-500' : 'text-error-500';
  }

  return (
    <Text size="sm" className={`font-semibold ${colorClass} ${className}`} {...props}>
      {children}
    </Text>
  );
};

import { DateRangeText, ContextText } from './CardTypography';

/** @deprecated Use ContextText from CardTypography directly. Kept for backward compatibility. */
export const ChartContextText = ContextText;

/** @deprecated Use DateRangeText from CardTypography directly. Kept for backward compatibility. */
export const ChartDateRangeText = DateRangeText;

export const getChartAxisStyle = (color: string, isBold: boolean = false) => ({
  color,
  fontSize: 10,
  fontWeight: isBold ? ('bold' as const) : ('normal' as const),
});

export const ChartAxisText = ({ children, style, isBold, ...props }: any) => {
  const customStyle = { fontSize: 10, ...style };
  if (isBold) {
    customStyle.fontWeight = 'bold';
  } else if (!customStyle.fontWeight) {
    customStyle.fontWeight = 'normal';
  }
  return (
    <Text style={customStyle} {...props}>
      {children}
    </Text>
  );
};
