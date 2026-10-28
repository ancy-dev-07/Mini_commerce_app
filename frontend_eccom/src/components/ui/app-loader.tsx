
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import AppText from '@/components/ui/app-text';

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function AppLoader({
  message = 'Loading...',
  fullScreen = false,
}: AppLoaderProps) {
  return (
    <View
      className="items-center justify-center gap-3"
      style={{
        flex: fullScreen ? 1 : undefined,
        padding: 24,
      }}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator
        size="large"
        color={Colors.light.primary}
      />

      <AppText color="secondary" type="small">
        {message}
      </AppText>
    </View>
  );
}
