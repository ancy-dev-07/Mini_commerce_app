
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getCart } from '../api/cart-api';
import type { CartResponse } from '../types/cart-item';
import { subscribeToCartChanges } from '../utils/cart-events';

export function useCart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);

      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Unable to load your cart.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    return subscribeToCartChanges(() => {
      void refetch();
    });
  }, [refetch]);

  return {
    cart,
    items: cart?.items ?? [],
    count: cart?.count ?? 0,
    total: cart?.total ?? '0.00',
    isLoading,
    error,
    refetch,
  };
}
