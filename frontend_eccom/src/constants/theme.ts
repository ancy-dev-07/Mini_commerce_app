

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#C86B4A',
    primaryDark: '#A85438',

    background: '#FAF9F7',
    surface: '#FFFFFF',

    text: '#1C1917',
    textSecondary: '#78716C',

    border: '#E7E2DC',
    backgroundElement: '#F0EDE9',
    backgroundSelected: '#E7E2DC',

    success: '#3F7D58',
    error: '#C2413B',
  },

  dark: {
    primary: '#D98262',
    primaryDark: '#C86B4A',

    background: '#1C1917',
    surface: '#292524',

    text: '#FAF9F7',
    textSecondary: '#A8A29E',

    border: '#44403C',
    backgroundElement: '#292524',
    backgroundSelected: '#44403C',

    success: '#5FA777',
    error: '#E05A54',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const MaxContentWidth = 800;
