// ============================================================
//  Connect. API — Barrel Export
//  Import from '@/api' instead of individual module paths.
//
//  Usage examples:
//    import { getAllProducts, getProductById } from '../api';
//    import { login, logout, getProfile }      from '../api';
//    import { getMyCart, addToCart }            from '../api';
//    import type { ProductDto, OrderDto }        from '../api';
// ============================================================

// ── Types ────────────────────────────────────────────────────
export type {
  // Enums
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
  ProductStatus,
  // Auth
  AuthTokens,
  UserDto,
  // Requests
  CheckEmailRequest,
  VerifyEmailRequest,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  // Resources
  ProductDto,
  CategoryDto,
  CouponDto,
  CartDto,
  AddToCartRequest,
  ReduceCartRequest,
  OrderDto,
  OrderItemDto,
  CreateOrderRequest,
  ReviewDto,
  CreateReviewRequest,
  UpdateReviewRequest,
  PaymentDto,
  CreatePaymentUrlRequest,
} from './types';

// ── Client utilities ─────────────────────────────────────────
export { API_BASE_URL, tokenStorage, ApiError } from './client';

// ── Users ────────────────────────────────────────────────────
export {
  checkEmail,
  verifyEmail,
  register,
  login,
  refreshToken,
  forgetPassword,
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,
  getAllUsers,
  logout,
} from './users';

// ── Products ─────────────────────────────────────────────────
export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductStock,
  updateProductImage,
  deleteProduct,
} from './products';

// ── Categories ───────────────────────────────────────────────
export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories';

// ── Coupons ──────────────────────────────────────────────────
export {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCouponExpiryDate,
  updateCouponQuantity,
} from './coupons';

// ── Carts ────────────────────────────────────────────────────
export {
  getMyCart,
  addToCart,
  reduceCartItem,
  removeCartItem,
  getAllCarts,
} from './carts';

// ── Orders ───────────────────────────────────────────────────
export {
  getOrderHistory,
  createOrder,
  cancelOrder,
  getAllOrders,
  markOrderAsShipping,
  markOrderAsCompleted,
  markOrderAsPaid,
} from './orders';

// ── Reviews ──────────────────────────────────────────────────
export {
  getAllReviews,
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from './reviews';

// ── Payments ─────────────────────────────────────────────────
export {
  createPaymentUrl,
  redirectToVNPAY,
  getAllPayments,
} from './payments';
