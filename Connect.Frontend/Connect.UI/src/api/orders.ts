// ============================================================
//  Connect. API — Orders Service
//  GET   /api/Orders/history       [Authorize]
//  POST  /api/Orders               [Authorize]
//  PATCH /api/Orders/{id}/cancel   [Authorize]
//  GET   /api/Orders               [Admin]
//  PATCH /api/Orders/{id}/shipping   [Admin]
//  PATCH /api/Orders/{id}/completed  [Admin]
//  PATCH /api/Orders/{id}/paid       [Admin]
// ============================================================

import { apiRequest } from './client';
import { OrderDto, CreateOrderRequest } from './types';

/**
 * Returns the order history for the current authenticated user.
 * ⚠️ Known backend bug: currently returns only a single order
 *    because the handler uses UserID as OrderID.
 */
export async function getOrderHistory(): Promise<OrderDto[]> {
  return apiRequest('/api/Orders/history');
}

/**
 * Places a new order.
 * Stock is deducted and coupon is consumed atomically.
 * Triggers an order confirmation email via Hangfire.
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderDto> {
  return apiRequest('/api/Orders', { method: 'POST', body: data });
}

/**
 * Cancels a pending order.
 * Only works when OrderStatus === 'Pending'.
 * Stock is restored transactionally.
 */
export async function cancelOrder(orderId: number): Promise<OrderDto> {
  return apiRequest(`/api/Orders/${orderId}/cancel`, { method: 'PATCH' });
}

/** [Admin] Returns all orders in the system. */
export async function getAllOrders(): Promise<OrderDto[]> {
  return apiRequest('/api/Orders');
}

/** [Admin] Advances an order to Shipping status. */
export async function markOrderAsShipping(orderId: number): Promise<OrderDto> {
  return apiRequest(`/api/Orders/${orderId}/shipping`, { method: 'PATCH' });
}

/** [Admin] Marks an order as Completed (requires PaymentStatus !== Unpaid). */
export async function markOrderAsCompleted(orderId: number): Promise<OrderDto> {
  return apiRequest(`/api/Orders/${orderId}/completed`, { method: 'PATCH' });
}

/** [Admin] Marks an order as Paid (used for cash orders). */
export async function markOrderAsPaid(orderId: number): Promise<OrderDto> {
  return apiRequest(`/api/Orders/${orderId}/paid`, { method: 'PATCH' });
}
