// ============================================================
//  Connect. API — Coupons Service
//  GET   /api/Coupons        [Authorize]
//  GET   /api/Coupons/{id}   [Authorize]
//  POST  /api/Coupons        [Admin]
//  PATCH /api/Coupons/{id}/expiry-date  [Admin]
//  PATCH /api/Coupons/{id}/quantity     [Admin]
// ============================================================

import { apiRequest } from './client';
import { CouponDto } from './types';

/** Returns all coupons (requires authentication). */
export async function getAllCoupons(): Promise<CouponDto[]> {
  return apiRequest('/api/Coupons');
}

/** Returns a single coupon by ID (requires authentication). */
export async function getCouponById(id: number): Promise<CouponDto> {
  return apiRequest(`/api/Coupons/${id}`);
}

/** [Admin] Creates a new coupon. */
export async function createCoupon(data: {
  couponCode: string;
  discountAmount: number;
  couponQuantity: number;
  expiryDate: string; // ISO 8601
}): Promise<CouponDto> {
  return apiRequest('/api/Coupons', { method: 'POST', body: data });
}

/** [Admin] Updates the expiry date of a coupon. */
export async function updateCouponExpiryDate(
  id: number,
  expiryDate: string, // ISO 8601
): Promise<CouponDto> {
  return apiRequest(`/api/Coupons/${id}/expiry-date`, {
    method: 'PATCH',
    body: { expiryDate },
  });
}

/** [Admin] Updates the quantity (stock) of a coupon. */
export async function updateCouponQuantity(
  id: number,
  couponQuantity: number,
): Promise<CouponDto> {
  return apiRequest(`/api/Coupons/${id}/quantity`, {
    method: 'PATCH',
    body: { couponQuantity },
  });
}
