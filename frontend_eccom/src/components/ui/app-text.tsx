
import {
  Text,
  type TextProps,
  useColorScheme,
} from 'react-native';
import type { ReactNode } from 'react';

import { Colors } from '@/constants/theme';

type AppTextType = 'default' | 'title' | 'subtitle' | 'small';
type AppTextColor = 'text' | 'secondary' | 'primary';

interface AppTextProps extends TextProps {
  children: ReactNode;
  type?: AppTextType;
  color?: AppTextColor;
  className?: string;
}

const textStyles: Record<AppTextType, string> = {
  default: 'text-base',
  title: 'text-4xl font-bold',
  subtitle: 'text-2xl font-semibold',
  small: 'text-sm font-medium',
};

export default function AppText({
  children,
  type = 'default',
  color = 'text',
  className,
  style,
  ...props
}: AppTextProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const textColors: Record<AppTextColor, string> = {
    text: theme.text,
    secondary: theme.textSecondary,
    primary: theme.primary,
  };

  return (
    <Text
      className={`${textStyles[type]} ${className ?? ''}`}
      style={[{ color: textColors[color] }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
