
import { apiClient } from '@/lib/api/axios';

import { Product } from '@/features/products/types/product';
import type {
  CreateProductFormData,
  ProductFile,
} from '@/features/products/types/create-product';


function appendFile(
  formData: FormData,
  fieldName: 'image' | 'product_file',
  file: ProductFile | null | undefined,
): void {
  if (!file) {
    return;
  }

  formData.append(
    fieldName,
    {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob,
  );
}
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('products/');

  return response.data;
};




export const createProduct = async (
  data: CreateProductFormData,
): Promise<Product> => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price);
  formData.append('category', data.category);
  formData.append('condition', data.condition);
  formData.append('stock', String(data.stock));

  appendFile(formData, 'image', data.image);
  appendFile(formData, 'product_file', data.product_file);

  const response = await apiClient.post<Product>(
    'products/',
    formData,
  );

  return response.data;
};
export const getProduct = async (
  id: number
): Promise<Product> => {
  const response = await apiClient.get<Product>(
    `products/${id}/`
  );

  return response.data;
};

export const updateProduct = async (
  id: number,
  data: FormData
): Promise<Product> => {
  const response = await apiClient.put<Product>(
    `products/${id}/`,
    data
  );

  return response.data;
};

export const deleteProduct = async (
  id: number
): Promise<void> => {
  await apiClient.delete(`products/${id}/`);
};
