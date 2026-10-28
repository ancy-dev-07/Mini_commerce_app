import { router } from 'expo-router';
import { View } from 'react-native';

import AppButton from '@/components/ui/app-button';
import ProductsScreen from '@/features/products/screens/products-screen';
import { Spacing } from '@/constants/theme';

export default function ProductsRoute() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: Spacing.md }}>
        <AppButton onPress={() => router.push('/products/create')}>
          + Create Product
        </AppButton>
      </View>

      <View style={{ flex: 1 }}>
        <ProductsScreen />
      </View>
    </View>
  );
}
