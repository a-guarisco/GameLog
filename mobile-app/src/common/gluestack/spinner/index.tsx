import { forwardRef, ComponentRef, ComponentProps } from 'react';
'use client';
import { ActivityIndicator } from 'react-native';

import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { brand } from '@gamelog/theme/theme';

cssInterop(ActivityIndicator, {
  className: { target: 'style', nativeStyleToProp: { color: true } },
});

const spinnerStyle = tva({});

const toHex = (rgb: string) => {
  const [r, g, b] = rgb.split(' ').map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const defaultPrimaryColor = toHex(brand.primary[500]);

const Spinner = forwardRef<
  ComponentRef<typeof ActivityIndicator>,
  ComponentProps<typeof ActivityIndicator>
>(function Spinner(
  {
    className,
    color = defaultPrimaryColor,
    focusable = false,
    'aria-label': ariaLabel = 'loading',
    ...props
  },
  ref
) {
  return (
    <ActivityIndicator
      ref={ref}
      focusable={focusable}
      aria-label={ariaLabel}
      {...props}
      color={color}
      className={spinnerStyle({ class: className })}
    />
  );
});

Spinner.displayName = 'Spinner';

export { Spinner };
