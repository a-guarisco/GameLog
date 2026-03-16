import { Text, TextProps } from 'react-native';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '../utils/tailwindUtils';

const textStyles = tv({
  base: 'text-text font-regular', // Default alla lettura standard
  variants: {
    variant: {
      h1: 'text-4xl font-heavy tracking-tighter leading-tight', //page titles, major headings
      h2: 'text-2xl font-bold tracking-tight', //section titles, minor headings
      h3: 'text-lg font-bold', //cards, subheadings

      body: 'text-base font-regular leading-relaxed', //primary body text
      bodySm: 'text-sm font-regular', //secondary body text, captions, etc.

      label: 'text-[10px] font-heavy uppercase tracking-[2px] opacity-70',
      caption: 'text-xs font-medium opacity-50',

      button: 'text-sm font-bold uppercase tracking-wider',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      contrast: 'text-background',
      error: 'text-red-500',
      muted: 'opacity-50',
    },
    align: {
      center: 'text-center',
      right: 'text-right',
      left: 'text-left',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

interface TextGLProps extends TextProps, VariantProps<typeof textStyles> {
  className?: string;
}

export const TextGL = ({ variant, color, align, className, ...props }: TextGLProps) => {
  return <Text className={textStyles({ variant, color, align, class: className })} {...props} />;
};
