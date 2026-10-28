
import { apiClient } from '@/lib/api/axios';
import { CartItem,AddToCartData,CartResponse } from '../types/cart-item';
export const addToCart = async (
  data: AddToCartData,
): Promise<CartItem> => {
  const response = await apiClient.post<CartItem>(
    'cart/',
    data,
  );

  return response.data;
};



export const getCart = async (): Promise<CartResponse> => {
  const response = await apiClient.get<CartResponse>('cart/');
  return response.data;
};
