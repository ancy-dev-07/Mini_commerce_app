
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  category_label: string;
  condition: string;
  condition_label: string;
  image: string | null;
  product_file: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
}
