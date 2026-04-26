// ============================================================
//  Connect. API — Categories Service
//  GET    /api/Categories
//  GET    /api/Categories/{id}
//  POST   /api/Categories     [Admin]
//  PUT    /api/Categories/{id} [Admin]
//  DELETE /api/Categories/{id} [Admin]
// ============================================================

import { apiRequest } from './client';
import { CategoryDto } from './types';

/** Returns all categories (anonymous). */
export async function getAllCategories(): Promise<CategoryDto[]> {
  return apiRequest('/api/Categories/getall-categories', { anonymous: true });
}

/** Returns a single category by ID (anonymous). */
export async function getCategoryById(id: number): Promise<CategoryDto> {
  return apiRequest(`/api/Categories/${id}/get-categorybyid`, { anonymous: true });
}

/** [Admin] Creates a new category. */
export async function createCategory(categoryName: string): Promise<CategoryDto> {
  return apiRequest('/api/Categories/create-category', {
    method: 'POST',
    body: { categoryName },
  });
}

/** [Admin] Updates an existing category name. */
export async function updateCategory(
  id: number,
  categoryName: string,
): Promise<CategoryDto> {
  return apiRequest(`/api/Categories/${id}/update-category`, {
    method: 'PUT',
    body: { categoryName },
  });
}

/** [Admin] Deletes a category. */
export async function deleteCategory(id: number): Promise<string> {
  return apiRequest(`/api/Categories/${id}/delete-category`, { method: 'DELETE' });
}
