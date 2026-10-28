
export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_image: string | null;
  price: string;
  stock: number;
  quantity: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  product: number;
  quantity: number;
}


export interface CartResponse {
  items: CartItem[];
  count: number;
  total: string;
}
