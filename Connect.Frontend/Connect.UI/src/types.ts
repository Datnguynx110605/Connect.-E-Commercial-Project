// These types match the backend API DTOs from API_references_ui.md

export interface User {
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
  oAuthProviderName: string | null;
  createdAt: string;
}

export interface Product {
  productID: number;
  categoryID: number;
  productName: string;
  description: string;
  originalPrice: number;
  finalPrice: number;
  stock: number;
  ram: number;
  rom: number;
  color: string;
  imageURL: string[];
  productStatus: string;
  createdAt: string;
}

export interface Category {
  categoryID: number;
  categoryName: string;
}

export interface Coupon {
  couponID: number;
  couponCode: string;
  discountAmount: number;
  couponQuantity: number;
  minimumPriceRequired: number;
  expiryDate: string;
}

export interface CartItem {
  cartID: number;
  userID: number;
  productID: number;
  cartQuantity: number;
  cartUnitPrice: number;
  cartTotalPrice: number;
  // Enriched client-side fields (filled after fetching product details)
  product?: Product;
}

export interface OrderItem {
  productID: number;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  orderID: number;
  userID: number;
  couponID: number | null;
  orderTotalItems: number;
  orderTotalItemPrice: number;
  orderFinalPrice: number;
  orderShippingMethod: string;
  orderPaymentMethod: string;
  orderPaymentStatus: string;
  orderStatus: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface Review {
  reviewID: number;
  userID: number;
  productID: number;
  rating: number;
  body: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
