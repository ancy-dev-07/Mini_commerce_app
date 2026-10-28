
import '@/global.css';

import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/ui/app-button';
import AppText from '@/components/ui/app-text';
import AppView from '@/components/ui/app-view';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <AppView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AppText type="small" color="secondary">
            WELCOME TO
          </AppText>

          <AppText type="title">
            Mini Product Store
          </AppText>

          <AppText color="secondary">
            Find something you love.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText type="subtitle" color="primary">
            Featured Products
          </AppText>

          <AppText color="secondary">
            Products will appear here soon.
          </AppText>

          <AppButton onPress={() => console.log('Theme preview button pressed')}>
            Test Theme Button
          </AppButton>
        </View>
      </SafeAreaView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
});
