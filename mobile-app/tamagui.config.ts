import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';
import { createAnimations } from '@tamagui/animations-react-native';

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 40,
  },
});

export const config = createTamagui({
  ...defaultConfig,
  animations,
});

export default config;

export type Conf = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
