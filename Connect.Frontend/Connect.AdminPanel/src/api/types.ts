export type OrderStatus = 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid';
export type PaymentMethod = 'Cash' | 'OnlineBanking' | 'VNPAY';
export type ShippingMethod = 'Standard' | 'Fast' | 'SuperFast';
export type ProductStatus = 'InStock' | 'OutOfStock';

// ─── Auth ─────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  userID: number;
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: 'Customer' | 'Admin';
  createdAt: string;
}

// ─── Request Bodies ───────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  userID: number;
  refreshToken: string;
}

// ─── Product ──────────────────────────────────────────────────

export interface ProductDto {
  productID: number;
  productName: string;
  description: string;
  originalPrice: number;
  finalPrice: number;
  stock: number;
  ram: number;
  rom: number;
  color: string;
  imageURL: string[];
  productStatus: ProductStatus;
  createdAt: string;
  categoryID?: number;
}

// ─── Category ─────────────────────────────────────────────────

export interface CategoryDto {
  categoryID: number;
  categoryName: string;
}

// ─── Coupon ───────────────────────────────────────────────────

export interface CouponDto {
  couponID: number;
  couponCode: string;
  discountAmount: number;
  couponQuantity: number;
  minimumPriceRequired: number;
  expiryDate: string;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────

export interface OrderItemDto {
  productID: number;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  orderID: number;
  userID: number;
  couponID?: number;
  orderTotalItems: number;
  orderTotalItemPrice: number;
  orderFinalPrice: number;
  orderShippingMethod: ShippingMethod;
  orderPaymentMethod: PaymentMethod;
  orderPaymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  orderItems: OrderItemDto[];
}

// ─── Review ───────────────────────────────────────────────────

export interface ReviewDto {
  reviewID: number;
  userID: number;
  productID: number;
  rating: number;
  body: string;
  createdAt: string;
}

// ─── Payment ──────────────────────────────────────────────────

export interface PaymentDto {
  paymentID: string;
  orderID: number;
  paymentType: string;
  transactionID: string;
  bankingInfo: string;
  totalAmount: number;
  isPaidSuccess: boolean;
  paidAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────

export interface CartDto {
  cartID: number;
  userID: number;
  productID: number;
  cartQuantity: number;
  cartUnitPrice: number;
  cartTotalPrice: number;
}
