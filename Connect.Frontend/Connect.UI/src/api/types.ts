// ============================================================
//  Connect. API — TypeScript Types
//  Mirrors backend DTOs & request shapes from API_References.md
// ============================================================

// ─── Enumerations ────────────────────────────────────────────

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

export interface CheckEmailRequest {
  email: string;
}

export interface VerifyEmailRequest {
  verificationToken: string;
}

export interface RegisterRequest {
  registrationSessionToken: string;
  userName: string;
  phoneNumber: string;
  password: string;
  address: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  userID: number;
  refreshToken: string;
}

export interface ForgetPasswordRequest {
  registrationSessionToken: string;
  newPasswordHash: string;
}

export interface UpdateProfileRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
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
  /** Backend does not return categoryID on list; only on detail */
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
  expiryDate: string;
  createdAt: string;
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

export interface AddToCartRequest {
  productID: number;
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
  orderTotalPrice: number;
  orderTotalItems: number;
  orderShippingMethod: ShippingMethod;
  orderPaymentMethod: PaymentMethod;
  orderPaymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  orderItems: OrderItemDto[];
}

export interface CreateOrderRequest {
  quantity: number;
  couponID?: number;
  orderShippingMethod: number; // enum value 0|1|2
  orderPaymentMethod: number;  // enum value 0|1|2
  items: Array<{ productID: number; unitPrice: number; quantity: number }>;
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

export interface CreateReviewRequest {
  productID: number;
  rating: number;
  body: string;
}

export interface UpdateReviewRequest {
  reviewID: number;
  rating: number;
  body: string;
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

export interface CreatePaymentUrlRequest {
  orderID: number;
}
