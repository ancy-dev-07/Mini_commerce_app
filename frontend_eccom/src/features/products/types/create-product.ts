
export interface CreateProductData {
  name: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  stock: number;
}

export interface ProductFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreateProductFormData extends CreateProductData {
  image?: ProductFile | null;
  product_file?: ProductFile | null;
}
