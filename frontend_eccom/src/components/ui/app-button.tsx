
import {
  Pressable,
  type PressableProps,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useState, type ReactNode } from 'react';

import { Colors } from '@/constants/theme';
import AppText from '@/components/ui/app-text';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
}

export default function AppButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AppButtonProps) {
  const [pressed, setPressed] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'secondary'
        ? theme.backgroundElement
        : 'transparent';

  const borderColor =
    variant === 'outline' ? theme.border : 'transparent';

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : theme.text;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      // Static style array (not a function): NativeWind's Pressable interop
      // can drop function-style `style`, leaving the button without a background.
      style={[
        {
          minHeight: 48,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText
          type="default"
          style={{ color: textColor, fontWeight: '600' }}
        >
          {children}
        </AppText>
      )}
    </Pressable>
  );
}
