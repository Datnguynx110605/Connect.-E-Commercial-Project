const API_BASE_URL = 'https://localhost:7240';

// ─── Token helpers ───────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

function getUserID(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nameid ? Number(payload.nameid) : (payload.sub ? Number(payload.sub) : null);
  } catch {
    return null;
  }
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const userID = getUserID();
  const refreshToken = getRefreshToken();
  if (!userID || !refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID, refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken();
    }
    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      throw new ApiError(401, 'Session expired. Please login again.');
    }
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message = data?.detail || data?.title || (typeof data === 'string' ? data : `Request failed with status ${res.status}`);
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ─── Types matching API responses ────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserDto {
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
  oAuthProviderName: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProductDto {
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

export interface CategoryDto {
  categoryID: number;
  categoryName: string;
}

export interface CouponDto {
  couponID: number;
  couponCode: string;
  discountAmount: number;
  couponQuantity: number;
  minimumPriceRequired: number;
  expiryDate: string;
}

export interface CartDto {
  cartID: number;
  userID: number;
  productID: number;
  cartQuantity: number;
  cartUnitPrice: number;
  cartTotalPrice: number;
}

export interface OrderItemDto {
  productID: number;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
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
  orderItems: OrderItemDto[];
  createdAt: string;
}

export interface ReviewDto {
  reviewID: number;
  userID: number;
  productID: number;
  rating: number;
  body: string;
  createdAt: string;
}

export interface PaymentUrlResponse {
  paymentUrl: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

// Auth & Users
export const authApi = {
  checkEmail: (email: string) =>
    apiFetch<{ message: string }>('/api/users/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyEmail: (verificationToken: string) =>
    apiFetch<{ registrationSessionToken: string }>('/api/users/verify-email', {
      method: 'POST',
      body: JSON.stringify({ verificationToken }),
    }),

  register: (data: {
    registrationSessionToken: string;
    userName: string;
    phoneNumber: string;
    password: string;
    address: string;
  }) =>
    apiFetch<UserDto>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getOAuthUrl: () => `${API_BASE_URL}/api/users/get-oauthauthurl`,

  refreshToken: (userID: number, refreshToken: string) =>
    apiFetch<LoginResponse>('/api/users/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ userID, refreshToken }),
    }),

  getProfile: () =>
    apiFetch<UserDto>('/api/users/get-profile', {}, true),

  updateProfile: (data: {
    userName: string;
    email: string;
    phoneNumber: string;
    address: string;
  }) =>
    apiFetch<UserDto>('/api/users/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  changePassword: (oldPassword: string, password: string) =>
    apiFetch<string>('/api/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, password }),
    }, true),

  deleteProfile: () =>
    apiFetch<void>('/api/users/delete-profile', {
      method: 'DELETE',
    }, true),
};

// Products
export const productsApi = {
  getAll: (page = 1, pageSize?: number) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (pageSize) params.append('pageSize', pageSize.toString());
    return apiFetch<PagedResult<ProductDto>>(`/api/products/getall-product?${params.toString()}`);
  },

  getDetail: (id: number) =>
    apiFetch<ProductDto>(`/api/products/${id}/get-productdetail`),

  getByCategory: (categoryId: number, page = 1, pageSize?: number) => {
    const params = new URLSearchParams({ id: categoryId.toString(), page: page.toString() });
    if (pageSize) params.append('pageSize', pageSize.toString());
    return apiFetch<PagedResult<ProductDto>>(`/api/products/get-product-bycategory?${params.toString()}`);
  },
};

// Categories
export const categoriesApi = {
  getAll: (page = 1, pageSize = 50) =>
    apiFetch<PagedResult<CategoryDto>>(
      `/api/categories/getall-category?page=${page}&pageSize=${pageSize}`
    ),
};

// Coupons
export const couponsApi = {
  getAll: (page = 1, pageSize = 50) =>
    apiFetch<PagedResult<CouponDto>>(
      `/api/coupons/getall-coupon?page=${page}&pageSize=${pageSize}`,
      {},
      true
    ),
};

// Cart
export const cartApi = {
  getMyCart: () =>
    apiFetch<PagedResult<CartDto>>('/api/carts/get-mycart', {}, true),

  addToCart: (productID: number, quantity: number) =>
    apiFetch<CartDto>('/api/carts/addto-cart', {
      method: 'POST',
      body: JSON.stringify({ productID, quantity }),
    }, true),

  increaseAmount: (cartId: number) =>
    apiFetch<CartDto>(`/api/carts/${cartId}/increase-cartamount`, {
      method: 'PATCH',
      body: '{}',
    }, true),

  reduceAmount: (cartId: number) =>
    apiFetch<CartDto>(`/api/carts/${cartId}/reduce-cartamount`, {
      method: 'PATCH',
      body: '{}',
    }, true),

  deleteCart: (cartId: number) =>
    apiFetch<string>(`/api/carts/${cartId}/delete-cart`, {
      method: 'DELETE',
    }, true),
};

// Orders
export const ordersApi = {
  getHistory: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<OrderDto>>(
      `/api/orders/get-orderhistory?page=${page}&pageSize=${pageSize}`,
      {},
      true
    ),

  create: (data: {
    items: { productID: number; unitPrice: number; quantity: number }[];
    couponID?: number | null;
    orderShippingMethod: number;
    orderPaymentMethod: number;
  }) =>
    apiFetch<OrderDto>('/api/orders/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  cancel: (orderId: number) =>
    apiFetch<OrderDto>(`/api/orders/${orderId}/cancel-order`, {
      method: 'PATCH',
    }, true),
};

// Reviews
export const reviewsApi = {
  getByProduct: (productId: number, page = 1, pageSize = 50) =>
    apiFetch<PagedResult<ReviewDto>>(
      `/api/reviews/${productId}/get-reviewbyproduct?page=${page}&pageSize=${pageSize}`
    ),

  create: (data: { productID: number; rating: number; body: string }) =>
    apiFetch<ReviewDto>('/api/reviews/create-review', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  update: (reviewId: number, data: { rating: number; body: string }) =>
    apiFetch<ReviewDto>(`/api/reviews/${reviewId}/update-review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  delete: (reviewId: number) =>
    apiFetch<void>(`/api/reviews/${reviewId}/delete-review`, {
      method: 'DELETE',
    }, true),
};

// Payments
export const paymentsApi = {
  createPaymentUrl: (orderID: number) =>
    apiFetch<PaymentUrlResponse>('/api/payments/create-paymenturl', {
      method: 'POST',
      body: JSON.stringify({ orderID }),
    }, true),
};

export { getAccessToken, getRefreshToken, setTokens, clearTokens, getUserID };
