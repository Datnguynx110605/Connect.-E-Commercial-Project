export interface User {
  id: string;
  username: string;
  email: string;
  address?: string;
  avatar?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  soldAmount: number;
  stock: number;
  isAppleVerified: boolean;
  images: string[];
  description: string;
  ramOptions?: string[];
  romOptions?: string[];
  colorOptions?: string[];
  feedbacks: Feedback[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  quantity: number;
  selectedRam?: string;
  selectedRom?: string;
  selectedColor?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  minTotal: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedRam?: string;
  selectedRom?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  shippingMethod: string;
  predictableDayOfArrival: string;
  paymentMethod: string;
  status: 'processing' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
}
