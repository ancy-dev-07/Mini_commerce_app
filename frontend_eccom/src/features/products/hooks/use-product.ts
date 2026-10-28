

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getProducts } from '@/features/products/api/products-api';
import type { Product } from '@/features/products/types/product';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Fetch products failed:', error);
      setError('Unable to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchProducts();
    }, [fetchProducts]),
  );

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

