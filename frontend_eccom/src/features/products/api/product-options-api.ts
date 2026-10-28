
import { apiClient } from '@/lib/api/axios';

export interface ProductOption {
  label: string;
  value: string;
}

export interface ProductFormOptions {
  categories: ProductOption[];
  conditions: ProductOption[];
}

export const getProductFormOptions =
  async (): Promise<ProductFormOptions> => {
    const response =
      await apiClient.get<ProductFormOptions>('options/');

    return response.data;
  };

