// ============================================================
//  Connect. API — Carts Service
//  GET    /api/Carts/me           [Authorize]
//  POST   /api/Carts                        [Authorize]
//  PATCH  /api/Carts/{id}/increase-cartamount [Authorize]
//  PATCH  /api/Carts/{id}/reduce-cartamount   [Authorize]
//  DELETE /api/Carts/{id}                   [Authorize]
//  GET    /api/Carts              [Admin]
// ============================================================

import { apiRequest } from './client';
import { CartDto, AddToCartRequest } from './types';

/** Returns the current authenticated user's cart items. */
export async function getMyCart(): Promise<CartDto[]> {
  return apiRequest('/api/Carts/me');
}

/** Adds a product to the current user's cart with initial quantity of 1. */
export async function addToCart(productID: number): Promise<CartDto> {
  return apiRequest('/api/Carts', { 
    method: 'POST', 
    body: { productID } 
  });
}

/**
 * Increases the quantity of a cart item by 1.
 * @param cartId  The CartID to increase
 */
export async function increaseCartAmount(cartId: number): Promise<CartDto> {
  return apiRequest(`/api/Carts/${cartId}/increase-cartamount`, {
    method: 'PATCH',
  });
}

/**
 * Reduces the quantity of a cart item by 1.
 * @param cartId  The CartID to reduce
 */
export async function reduceCartAmount(cartId: number): Promise<CartDto> {
  return apiRequest(`/api/Carts/${cartId}/reduce-cartamount`, {
    method: 'PATCH',
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
