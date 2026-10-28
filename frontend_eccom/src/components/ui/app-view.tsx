
import { View, type ViewProps, useColorScheme } from 'react-native';
import type { ReactNode } from 'react';

import { Colors } from '@/constants/theme';

interface AppViewProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  variant?: 'background' | 'surface';
}

export default function AppView({
  children,
  className,
  variant = 'background',
  style,
  ...props
}: AppViewProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const backgroundColor =
    variant === 'surface' ? theme.surface : theme.background;

  return (
    <View
      className={className}
      style={[{ backgroundColor }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
