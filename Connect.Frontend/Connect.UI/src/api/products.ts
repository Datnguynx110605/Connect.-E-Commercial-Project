// ============================================================
//  Connect. API — Products Service
//  GET    /api/Products
//  GET    /api/Products/{id}
//  POST   /api/Products          [Admin]
//  PATCH  /api/Products/{id}/stock  [Admin]
//  PATCH  /api/Products/{id}/image  [Admin]
//  DELETE /api/Products/{id}     [Admin]
// ============================================================

import { apiRequest } from './client';
import { ProductDto } from './types';

/**
 * Returns all products (anonymous).
 */
export async function getAllProducts(): Promise<ProductDto[]> {
  return apiRequest('/api/Products', { anonymous: true });
}

/**
 * Returns the detail of a single product (anonymous).
 */
export async function getProductById(id: number): Promise<ProductDto> {
  return apiRequest(`/api/Products/${id}`, { anonymous: true });
}

/**
 * [Admin] Creates a new product.
 * Uses multipart/form-data — handled separately via FormData.
 */
export async function createProduct(formData: FormData): Promise<ProductDto> {
  const token = (await import('./client')).tokenStorage.getAccess();
  const response = await fetch(
    `${(await import('./client')).API_BASE_URL}/api/Products`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // No Content-Type header — browser sets multipart boundary
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.title ?? `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * [Admin] Adds stock to a product (additive, not a set).
 */
export async function updateProductStock(
  id: number,
  addQuantity: number,
): Promise<ProductDto> {
  return apiRequest(`/api/Products/${id}/stock`, {
    method: 'PATCH',
    body: { quantity: addQuantity },
  });
}

/**
 * [Admin] Replaces the image URL list for a product.
 */
export async function updateProductImage(
  id: number,
  imageURLs: string[],
): Promise<ProductDto> {
  return apiRequest(`/api/Products/${id}/image`, {
    method: 'PATCH',
    body: { imageURLs },
  });
}

/**
 * [Admin] Deletes a product.
 */
export async function deleteProduct(id: number): Promise<string> {
  return apiRequest(`/api/Products/${id}`, { method: 'DELETE' });
}
