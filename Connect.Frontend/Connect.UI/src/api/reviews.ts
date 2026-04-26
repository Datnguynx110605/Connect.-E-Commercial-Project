import { apiRequest } from './client';
import { ReviewDto, CreateReviewRequest, UpdateReviewRequest } from './types';


export async function getReviewsByProduct(productId: number): Promise<ReviewDto[]> {
  return apiRequest(`/api/Reviews/${productId}/get-reviewbyproduct`, { anonymous: true });
}

export async function createReview(data: CreateReviewRequest): Promise<ReviewDto> {
  return apiRequest('/api/Reviews/create-review', { method: 'POST', body: data });
}

export async function updateReview(reviewId: number, data: UpdateReviewRequest): Promise<ReviewDto> {
  return apiRequest(`/api/Reviews/${reviewId}/update-review`, { method: 'PUT', body: data });
}

export async function deleteReview(reviewId: number): Promise<string> {
  return apiRequest(`/api/Reviews/${reviewId}/delete-review`, { method: 'DELETE' });
}
