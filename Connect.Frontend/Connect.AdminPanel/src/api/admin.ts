import { apiRequest } from './client';
import {
  CartDto,
  CategoryDto,
  CouponDto,
  OrderDto,
  PaymentDto,
  ProductDto,
  ReviewDto,
  UserDto,
  LoginRequest,
  AuthTokens
} from './types';

// ─── Auth ─────────────────────────────────────────────────────

export async function login(data: LoginRequest): Promise<{ accessToken: string; refreshToken: string }> {
  return apiRequest<{ accessToken: string; refreshToken: string }>('/api/Users/login', {
    method: 'POST',
    body: data,
    anonymous: true,
  });
}

export async function getProfile(): Promise<UserDto> {
  return apiRequest<UserDto>('/api/Users/get-profile');
}

// ─── Admin Endpoints ──────────────────────────────────────────

export async function getAllCarts(): Promise<CartDto[]> {
  return apiRequest<CartDto[]>('/api/Carts/getall-cart');
}

export async function getAllCategories(): Promise<CategoryDto[]> {
  return apiRequest<CategoryDto[]>('/api/Categories/getall-category');
}

export async function createCategory(name: string): Promise<CategoryDto> {
  return apiRequest<CategoryDto>('/api/Categories/create-category', {
    method: 'POST',
    body: { categoryName: name },
  });
}

export async function updateCategory(id: number, name: string): Promise<CategoryDto> {
  return apiRequest<CategoryDto>(`/api/Categories/${id}/update-category`, {
    method: 'PUT',
    body: { categoryID: id, categoryName: name },
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<void>(`/api/Categories/${id}/delete-category`, { method: 'DELETE' });
}

export async function getAllCoupons(): Promise<CouponDto[]> {
  return apiRequest<CouponDto[]>('/api/Coupons/getall-coupons');
}

export async function createCoupon(data: Partial<CouponDto>): Promise<CouponDto> {
  return apiRequest<CouponDto>('/api/Coupons/create-coupon', {
    method: 'POST',
    body: data,
  });
}

export async function getAllOrders(): Promise<OrderDto[]> {
  return apiRequest<OrderDto[]>('/api/Orders/getall-order');
}

export async function updateOrderStatusToShipping(id: number, status: string): Promise<void> {
  await apiRequest<void>(`/api/Orders/${id}/update-statustoshipping`, {
    method: 'PATCH',
    body: { orderID: id, orderStatus: status },
  });
}

export async function updateOrderStatusToComplete(id: number, status: string): Promise<void> {
  await apiRequest<void>(`/api/Orders/${id}/update-statustocomplete`, {
    method: 'PATCH',
    body: { orderID: id, orderStatus: status },
  });
}

export async function markOrderAsPaid(id: number, paymentStatus: string): Promise<void> {
  await apiRequest<void>(`/api/Orders/${id}/markas-paid`, {
    method: 'PATCH',
    body: { orderID: id, orderPaymentStatus: paymentStatus },
  });
}

export async function cancelOrder(id: number): Promise<void> {
  await apiRequest<void>(`/api/Orders/${id}/cancel-order`, { method: 'PATCH' });
}

export async function getAllPayments(): Promise<PaymentDto[]> {
  return apiRequest<PaymentDto[]>('/api/Payments/getall-payment');
}

export async function getAllProducts(): Promise<ProductDto[]> {
  return apiRequest<ProductDto[]>('/api/Products/getall-product');
}

export async function createProduct(formData: FormData): Promise<ProductDto> {
  return apiRequest<ProductDto>('/api/Products/create-product', {
    method: 'POST',
    body: formData,
  });
}

export async function updateProductStock(id: number, stock: number): Promise<void> {
  await apiRequest<void>(`/api/Products/${id}/update-stock`, {
    method: 'PATCH',
    body: { productID: id, stock },
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await apiRequest<void>(`/api/Products/${id}/delete-product`, { method: 'DELETE' });
}

export async function getAllReviews(): Promise<ReviewDto[]> {
  return apiRequest<ReviewDto[]>('/api/Reviews/getall-review');
}

export async function getAllUsers(): Promise<UserDto[]> {
  return apiRequest<UserDto[]>('/api/Users/getall-user');
}
