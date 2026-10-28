
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  View,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import AppText from '@/components/ui/app-text';
import AppView from '@/components/ui/app-view';
import AppButton from '@/components/ui/app-button';
import { Colors, Spacing } from '@/constants/theme';

import { getCart } from '../api/cart-api';
// import type { CartItem, CartResponse } from '@/features/products/types/cart-item';
import { CartItem,CartResponse } from '../types/cart-item';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Unable to load your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCart();
    }, [loadCart]),
  );

  if (isLoading && !cart) {
    return (
      <AppView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={theme.primary} />
        <AppText>Loading your cart...</AppText>
      </AppView>
    );
  }

  if (error && !cart) {
    return (
      <AppView className="flex-1 items-center justify-center p-6">
        <AppText>{error}</AppText>
        <AppButton onPress={() => void loadCart()}>
          Try Again
        </AppButton>
      </AppView>
    );
  }

  const items = cart?.items ?? [];

  return (
    <AppView className="flex-1">
      <FlatList
        data={items}
        keyExtractor={(item: CartItem) => String(item.id)}
        contentContainerStyle={{
          padding: Spacing.md,
          paddingBottom: Spacing.xxl,
          flexGrow: 1,
          gap: Spacing.md,
        }}
        refreshing={isLoading}
        onRefresh={() => void loadCart()}
        ListHeaderComponent={
          <AppText type="title">My Cart ({cart?.count ?? 0})</AppText>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: Spacing.xl }}>
            <AppText type="subtitle">Your cart is empty</AppText>
            <AppText color="secondary">
              Add a product to see it here.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              gap: Spacing.md,
              padding: Spacing.md,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            {item.product_image ? (
              <Image
                source={{ uri: item.product_image }}
                accessibilityLabel={item.product_name}
                style={{
                  width: 90,
                  height: 100,
                  borderRadius: 10,
                  backgroundColor: theme.backgroundElement,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 100,
                  borderRadius: 10,
                  backgroundColor: theme.backgroundElement,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText color="secondary">No image</AppText>
              </View>
            )}

            <View style={{ flex: 1, gap: Spacing.xs }}>
              <AppText type="subtitle">{item.product_name}</AppText>
              <AppText color="primary">₹{item.price}</AppText>
              <AppText color="secondary">
                Quantity: {item.quantity}
              </AppText>
              <AppText type="subtitle">
                Subtotal: ₹{item.subtotal}
              </AppText>
            </View>
          </View>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <View
              style={{
                padding: Spacing.md,
                gap: Spacing.sm,
                borderRadius: 16,
                backgroundColor: theme.backgroundElement,
              }}
            >
              <AppText type="subtitle">
                Total: ₹{cart?.total ?? '0.00'}
              </AppText>
              <AppText color="secondary" type="small">
                {cart?.count ?? 0} item(s) in your cart
              </AppText>
            </View>
          ) : null
        }
      />
    </AppView>
  );
}
