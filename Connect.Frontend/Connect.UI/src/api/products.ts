import { apiRequest } from './client';
import { ProductDto } from './types';

export async function getAllProducts(): Promise<ProductDto[]> {
  return apiRequest('/api/Products/getall-product', { anonymous: true });
}

export async function getProductById(id: number): Promise<ProductDto> {
  return apiRequest(`/api/Products/${id}/get-productdetail`, { anonymous: true });
}

export async function getProductByCategory(categoryID: number): Promise<ProductDto[]> {
  return apiRequest(`/api/Products/get-product-bycategory?id=${categoryID}`, { anonymous: true });
}