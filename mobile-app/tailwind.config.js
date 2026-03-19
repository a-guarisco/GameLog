module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        thin: ['DMSans-Thin'],
        extraLight: ['DMSans-ExtraLight'],
        light: ['DMSans-Light'],
        regular: ['DMSans-Regular'],
        medium: ['DMSans-Medium'],
        bold: ['DMSans-Bold'],
        heavy: ['DMSans-Heavy'],
      },
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        border: 'var(--color-border)',
      },
    },
  },
};
