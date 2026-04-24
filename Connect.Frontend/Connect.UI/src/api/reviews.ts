// ============================================================
//  Connect. API — Reviews Service
//  GET    /api/Reviews                         (anonymous)
//  GET    /api/Reviews/product/{productId}     (anonymous)
//  POST   /api/Reviews              [Authorize]
//  PUT    /api/Reviews/{id}         [Authorize]
//  DELETE /api/Reviews/{id}         [Authorize]
// ============================================================

import { apiRequest } from './client';
import { ReviewDto, CreateReviewRequest, UpdateReviewRequest } from './types';

/** Returns all reviews across all products (anonymous). */
export async function getAllReviews(): Promise<ReviewDto[]> {
  return apiRequest('/api/Reviews', { anonymous: true });
}

/** Returns all reviews for a specific product (anonymous). */
export async function getReviewsByProduct(productId: number): Promise<ReviewDto[]> {
  return apiRequest(`/api/Reviews/product/${productId}`, { anonymous: true });
}

/**
 * Creates a review for a product.
 * One review per user per product — enforced at DB level.
 * Body: 1–2,000 chars.
 */
export async function createReview(data: CreateReviewRequest): Promise<ReviewDto> {
  return apiRequest('/api/Reviews', { method: 'POST', body: data });
}

/**
 * Updates an existing review.
 * Body: 5–300 chars (stricter than creation).
 */
export async function updateReview(
  reviewId: number,
  data: UpdateReviewRequest,
): Promise<ReviewDto> {
  return apiRequest(`/api/Reviews/${reviewId}`, { method: 'PUT', body: data });
}

/** Deletes a review (owner only). */
export async function deleteReview(reviewId: number): Promise<string> {
  return apiRequest(`/api/Reviews/${reviewId}`, { method: 'DELETE' });
}
