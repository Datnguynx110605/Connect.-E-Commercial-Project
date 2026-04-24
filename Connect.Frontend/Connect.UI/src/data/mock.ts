export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export type Product = {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  category: string;
  ram?: string;
  rom?: string;
  color: string;
  status: 'Mới' | 'Hot' | 'Hết hàng' | 'Sắp về';
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
};

export const CATEGORIES: string[] = [];

export const MOCK_PRODUCTS: Product[] = [];

