import '@/global.css';
import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import Onboarding from '@/components/onboarding';
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = 'onboardingCompleted';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // null means we are still checking saved data.
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(completed !== 'true');
      } catch (error) {
        console.warn('Could not read onboarding status:', error);
        setShowOnboarding(true);
      }
    }

    checkOnboardingStatus();
  }, []);

  // async function handleOnboardingFinish() {
  //   try {
  //     await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  //   } catch (error) {
  //     console.warn('Could not save onboarding status:', error);
  //   } finally {
  //     setShowOnboarding(false);
  //   }
  // }

async function handleOnboardingFinish() {
  console.log('Get Started pressed: finishing onboarding');

  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    console.log('Onboarding completion saved');
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
  }

  setShowOnboarding(false);
  console.log('Onboarding overlay hidden');
}


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* The navigator must always be mounted so Expo Router can render routes. */}
      <AppTabs />

      {/* Cover the tabs while checking storage, then show onboarding on top if needed. */}
      {showOnboarding !== false && (
        <View style={styles.overlay}>
          {showOnboarding && <Onboarding onFinish={handleOnboardingFinish} />}
        </View>
      )}

      {/* Stack above the onboarding overlay (zIndex 10); never block touches. */}
      <View pointerEvents="none" style={styles.splashLayer}>
        <AnimatedSplashOverlay />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  splashLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
});
