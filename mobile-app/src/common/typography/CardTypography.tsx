import { ReactNode } from 'react';
import { Text } from '@gamelog/common/gluestack/text';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/** Uppercase label used as section/card title (e.g. "REPORT RETRIEVAL", "TOTAL HOURS"). */
export const CardTitleText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text
    size="2xs"
    className={`font-bold uppercase text-typography-400 ${className}`}
    style={{ letterSpacing: 1 }}
    {...props}
  >
    {children}
  </Text>
);

/** Date range or contextual info shown alongside stats (e.g. "Aug 14 — Aug 27 · 14 days"). */
export const DateRangeText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text size="sm" className={`font-medium text-typography-300 ${className}`} {...props}>
    {children}
  </Text>
);

/** Text used for the From/To date selectors. Centered and clear. */
export const DateSelectorText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text size="sm" className={`font-bold text-typography-0 text-center ${className}`} {...props}>
    {children}
  </Text>
);

/** Clickable text for external links or deep jumps (e.g. "Go to Steam"). Blue. */
export const GoToText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text size="sm" className={`font-bold text-primary-300 ${className}`} {...props}>
    {children}
  </Text>
);

/** Clickable "see more" / "see all" text for internal navigation or expansion. Neutral. */
export const SeeMoreText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text size="sm" className={`font-bold text-typography-300 ${className}`} {...props}>
    {children}
  </Text>
);

/** Large bold value displayed in stat blocks (e.g. "45h", "8", "CS2"). */
export const StatValueText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text size="md" className={`font-bold text-typography-0 ${className}`} numberOfLines={2} {...props}>
    {children}
  </Text>
);

/** Uppercase micro-label below stat values (e.g. "PLAYTIME", "GAMES", "TOP GAME"). */
export const StatLabelText = ({ children, className = '', ...props }: TypographyProps) => (
  <Text
    size="2xs"
    className={`font-bold uppercase text-typography-300 ${className}`}
    style={{ letterSpacing: 1 }}
    numberOfLines={1}
    {...props}
  >
    {children}
  </Text>
);
