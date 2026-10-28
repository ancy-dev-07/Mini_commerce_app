
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  View,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import AppButton from '@/components/ui/app-button';
import AppText from '@/components/ui/app-text';
import AppView from '@/components/ui/app-view';
import AppLoader from '@/components/ui/app-loader';

import { Colors, Spacing } from '@/constants/theme';
import { getProduct } from '@/features/products/api/products-api';
import { addToCart } from '@/features/cart/api/cart-api';
import { notifyCartChanged } from '@/features/cart/utils/cart-events';

import type { Product } from '@/features/products/types/product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const fetchProduct = useCallback(async () => {
    if (!id || Array.isArray(id) || !Number.isFinite(Number(id))) {
      setError('Invalid product ID.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getProduct(Number(id));
      setProduct(response);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Unable to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  //   if (!product || isAddingToCart) {
  //     return;
  //   }

  //   if (product.stock <= 0) {
  //     Alert.alert('Out of stock', 'This product is currently unavailable.');
  //     return;
  //   }

  //   try {
  //     setIsAddingToCart(true);

  //     await addToCart({
  //       product: product.id,
  //       quantity: 1,
  //     });

  //     notifyCartChanged();

  //     Alert.alert(
  //       'Added to Cart',
  //       `${product.name} has been added to your cart.`,
  //       [
  //         {
  //           text: 'Continue Shopping',
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'View Cart',
  //           onPress: () => router.navigate('/cart'),
  //         },
  //       ],
  //     );
  //   } catch (err) {
  //     console.error('Failed to add product to cart:', err);

  //     Alert.alert(
  //       'Error',
  //       'Unable to add this product to your cart. Please try again.',
  //     );
  //   } finally {
  //     setIsAddingToCart(false);
  //   }
  // };
  
const handleAddToCart = async () => {
  if (!product || isAddingToCart) {
    return;
  }

  if (product.stock <= 0) {
    Alert.alert('Out of stock', 'This product is currently unavailable.');
    return;
  }

  try {
    setIsAddingToCart(true);

    await addToCart({
      product: product.id,
      quantity: 1,
    });

    notifyCartChanged();

    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => {
            router.navigate('/cart');
          },
        },
      ],
    );
  } catch (err) {
    console.error('Failed to add product to cart:', err);

    Alert.alert(
      'Error',
      'Unable to add this product to your cart. Please try again.',
    );
  } finally {
    setIsAddingToCart(false);
  }
};


  if (isLoading) {
    return (
      <AppView className="flex-1 items-center justify-center">
        <AppLoader
          message="Loading product details..."
          fullScreen
        />
      </AppView>
    );
  }

  if (error || !product) {
    return (
      <AppView className="flex-1 items-center justify-center p-6">
        <AppText type="subtitle">
          Unable to load product
        </AppText>

        <AppText color="secondary">
          {error ?? 'Product not found.'}
        </AppText>

        <AppButton
          onPress={() => void fetchProduct()}
          style={{ marginTop: Spacing.md }}
        >
          Try Again
        </AppButton>

        <AppButton
          variant="secondary"
          onPress={() => router.back()}
          style={{ marginTop: Spacing.sm }}
        >
          Go Back
        </AppButton>
      </AppView>
    );
  }

  return (
    <AppView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: Spacing.md,
          paddingBottom: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        {/* Product image */}
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            resizeMode="cover"
            accessibilityLabel={product.name}
            style={{
              width: '100%',
              height: 280,
              borderRadius: 18,
              backgroundColor: theme.backgroundElement,
            }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 220,
              borderRadius: 18,
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

        {/* Product name and price */}
        <AppText type="title">
          {product.name}
        </AppText>

        <AppText type="subtitle" color="primary">
          ₹{product.price}
        </AppText>

        {/* Category */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: theme.backgroundElement,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: 10,
          }}
        >
          <AppText>
            Category: {product.category_label}
          </AppText>
        </View>

        {/* Condition */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: theme.backgroundElement,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: 10,
          }}
        >
          <AppText>
            Condition: {product.condition_label}
          </AppText>
        </View>

        {/* Description */}
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            padding: Spacing.md,
            gap: Spacing.sm,
          }}
        >
          <AppText type="subtitle">
            Description
          </AppText>

          <AppText color="secondary">
            {product.description?.trim() ||
              'No description available.'}
          </AppText>
        </View>

        {/* Stock status */}
        <AppText
          color={product.stock > 0 ? 'secondary' : undefined}
        >
          {product.stock > 0
            ? `${product.stock} available in stock`
            : 'Currently out of stock'}
        </AppText>

        {/* Add to cart */}
        <AppButton
          variant="primary"
          onPress={() => void handleAddToCart()}
          disabled={product.stock <= 0 || isAddingToCart}
          style={{
            minHeight: 52,
            borderRadius: 14,
            backgroundColor:
              product.stock <= 0 || isAddingToCart
                ? theme.textSecondary
                : theme.primary,
            elevation: 3,
          }}
        >
          {isAddingToCart
            ? 'Adding to Cart...'
            : product.stock <= 0
              ? 'Out of Stock'
              : 'Add to Cart'}
        </AppButton>

        {isAddingToCart ? (
          <ActivityIndicator color={theme.primary} />
        ) : null}

        {/* Open cart */}
        <AppButton
          variant="secondary"
          onPress={() => router.navigate('/cart')}
          style={{
            minHeight: 48,
            borderRadius: 14,
          }}
        >
          View Cart
        </AppButton>
      </ScrollView>
    </AppView>
  );
}
