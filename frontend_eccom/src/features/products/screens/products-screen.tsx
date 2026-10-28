
import {
  FlatList,
  Image,
  Pressable,
  View,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';

import AppButton from '@/components/ui/app-button';
import AppText from '@/components/ui/app-text';
import AppView from '@/components/ui/app-view';
import AppLoader from '@/components/ui/app-loader';

import { Colors, Spacing } from '@/constants/theme';
import { useProducts } from '../hooks/use-product';
import { useCart } from '@/features/cart/hooks/use-cart';

import type { Product } from '@/features/products/types/product';

export default function ProductsScreen() {
  const { products, isLoading, error, refetch } = useProducts();
  const { count } = useCart();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const openProductDetails = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: String(product.id) },
    });
  };

  const openCart = () => {
    router.navigate('/cart');
  };

  if (isLoading && products.length === 0) {
    return (
      <AppView className="flex-1">
        <AppLoader message="Loading products..." fullScreen />
      </AppView>
    );
  }

  if (error && products.length === 0) {
    return (
      <AppView className="flex-1 items-center justify-center p-6">
        <AppText>{error}</AppText>

        <AppButton
          onPress={() => void refetch()}
          style={{ marginTop: Spacing.md }}
        >
          Try Again
        </AppButton>
      </AppView>
    );
  }

  return (
    <AppView className="flex-1">
      {/* Header with cart icon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText type="subtitle">Explore Products</AppText>
          <AppText color="secondary">
            {products.length}{' '}
            {products.length === 1 ? 'product' : 'products'} available
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open cart, ${count} items`}
          onPress={openCart}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundElement,
          }}
        >
          <AppText>🛒</AppText>

          {count > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                paddingHorizontal: 4,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {count > 99 ? '99+' : count}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          padding: Spacing.md,
          paddingBottom: Spacing.xxl,
          gap: Spacing.md,
          flexGrow: 1,
        }}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          error ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <AppText color="secondary">
                Could not refresh products. Showing previously loaded products.
              </AppText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: Spacing.lg }}>
            <AppText type="subtitle">No products yet</AppText>
            <AppText color="secondary">
              Your products will appear here when they are added.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 18,
              padding: Spacing.md,
              gap: Spacing.sm,
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                resizeMode="cover"
                accessibilityLabel={item.name}
                style={{
                  width: '100%',
                  height: 190,
                  borderRadius: 12,
                  backgroundColor: theme.backgroundElement,
                }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 150,
                  borderRadius: 12,
                  backgroundColor: theme.backgroundElement,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText color="secondary">
                  No image available
                </AppText>
              </View>
            )}

            <AppText type="subtitle">{item.name}</AppText>

            <AppText color="primary" type="subtitle">
              ₹{item.price}
            </AppText>

            <AppText color="secondary" type="small">
              {item.category_label}
            </AppText>

            <AppText color="secondary" type="small">
              {item.condition_label}
            </AppText>

            <AppText color="secondary" type="small">
              {item.stock > 0
                ? `${item.stock} in stock`
                : 'Out of stock'}
            </AppText>

            <AppButton
              variant="primary"
              onPress={() => openProductDetails(item)}
              style={{
                marginTop: Spacing.sm,
                minHeight: 50,
                borderRadius: 14,
                backgroundColor: theme.primary,
                elevation: 3,
              }}
            >
              View Product
            </AppButton>
          </View>
        )}
      />
    </AppView>
  );
}
