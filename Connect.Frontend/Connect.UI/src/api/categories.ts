import { apiRequest } from './client';
import { CategoryDto } from './types';

export async function getAllCategories(): Promise<CategoryDto[]> {
  return apiRequest('/api/Categories/getall-category', { anonymous: true });
}

export async function getCategoryById(id: number): Promise<CategoryDto> {
  return apiRequest(`/api/Categories/${id}/get-categorybyid`, { anonymous: true });
}

