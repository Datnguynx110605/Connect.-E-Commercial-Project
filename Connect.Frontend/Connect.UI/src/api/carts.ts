import { apiRequest } from './client';
import { CartDto, AddToCartRequest } from './types';

export async function getMyCart(): Promise<CartDto[]> {
  return apiRequest('/api/Carts/get-mycart');
}

export async function addToCart(productID: number, quantity: number = 1): Promise<CartDto> {
  return apiRequest('/api/Carts/addto-cart', { 
    method: 'POST', 
    body: { productID, quantity } 
  });
}

export async function increaseCartAmount(cartId: number, quantity: number = 1): Promise<CartDto> {
  return apiRequest(`/api/Carts/${cartId}/increase-cartamount`, {
    method: 'PATCH',
    body: { quantity }
  });
}

export async function reduceCartAmount(cartId: number, quantity: number = 1): Promise<CartDto> {
  return apiRequest(`/api/Carts/${cartId}/reduce-cartamount`, {
    method: 'PATCH',
    body: { quantity }
  });
}

export async function removeCartItem(cartId: number): Promise<string> {
  return apiRequest(`/api/Carts/${cartId}/delete-cart`, { method: 'DELETE' });
}

