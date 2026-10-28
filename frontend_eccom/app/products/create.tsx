
import { Alert } from 'react-native';
import { router } from 'expo-router';

import ProductForm from '@/features/products/components/ProductForm';
import { createProduct } from '@/features/products/api/products-api';
import type { CreateProductFormData } from '@/features/products/types/create-product';

export default function CreateProductScreen() {
  const handleCreateProduct = async (
    values: CreateProductFormData,
  ): Promise<void> => {
    await createProduct(values);

    Alert.alert(
      'Success',
      'Product created successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return <ProductForm onSubmit={handleCreateProduct} />;
}
