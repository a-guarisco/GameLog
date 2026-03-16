import { View, ViewProps } from 'react-native';
import { type VariantProps } from 'tailwind-variants';

import { tv } from '@gamelog/utils/tailwindUtils';

const viewStyles = tv({
  base: 'flex-1 bg-background',
  variants: {
    align: {
      center: 'items-center justify-center',
      start: 'items-start justify-start',
      centerTop: 'items-center justify-start',
      between: 'justify-between',
    },
    pad: {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    align: 'start',
    pad: 'none',
  },
});

interface ViewGLProps extends ViewProps, VariantProps<typeof viewStyles> {
  className?: string;
}

export const ViewGL = ({ align, pad, gap, className, ...props }: ViewGLProps) => {
  return <View className={viewStyles({ align, pad, gap, class: className })} {...props} />;
};
