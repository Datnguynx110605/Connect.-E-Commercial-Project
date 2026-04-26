import { apiRequest } from './client';
import { CouponDto } from './types';

export async function getAllCoupons(): Promise<CouponDto[]> {
  return apiRequest('/api/Coupons/getall-coupon');
}

export async function getCouponById(id: number): Promise<CouponDto> {
  return apiRequest(`/api/Coupons/${id}/get-couponbyid`);
}
