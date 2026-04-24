// ============================================================
//  Connect. API — Carts Service
//  GET    /api/Carts/me           [Authorize]
//  POST   /api/Carts              [Authorize]
//  PATCH  /api/Carts/{id}/reduce  [Authorize]
//  DELETE /api/Carts/{id}         [Authorize]
//  GET    /api/Carts              [Admin]
// ============================================================

import { apiRequest } from './client';
import { CartDto, AddToCartRequest, ReduceCartRequest } from './types';

/** Returns the current authenticated user's cart items. */
export async function getMyCart(): Promise<CartDto[]> {
  return apiRequest('/api/Carts/me');
}

/** Adds a product to the current user's cart. */
export async function addToCart(data: AddToCartRequest): Promise<CartDto> {
  return apiRequest('/api/Carts', { method: 'POST', body: data });
}

/**
 * Reduces the quantity of a cart item.
 * @param cartId  The CartID to reduce
 */
export async function reduceCartItem(
  cartId: number,
  data: ReduceCartRequest,
): Promise<CartDto> {
  return apiRequest(`/api/Carts/${cartId}/reduce`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Removes a cart item entirely.
 * @param cartId  The CartID to remove
 */
export async function removeCartItem(cartId: number): Promise<string> {
  return apiRequest(`/api/Carts/${cartId}`, { method: 'DELETE' });
}

/** [Admin] Returns all cart items across all users. */
export async function getAllCarts(): Promise<CartDto[]> {
  return apiRequest('/api/Carts');
}
