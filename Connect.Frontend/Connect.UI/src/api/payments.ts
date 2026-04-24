// ============================================================
//  Connect. API — Payments Service
//  POST /api/Payments/create-url    [Authorize]
//  GET  /api/Payments/vnpay-callback (anonymous — VNPAY redirect)
//  GET  /api/Payments               [Admin]
// ============================================================

import { apiRequest } from './client';
import { PaymentDto, CreatePaymentUrlRequest } from './types';

/**
 * Creates a VNPAY payment URL for the given order.
 * The returned URL should be used to redirect the user to VNPAY checkout.
 */
export async function createPaymentUrl(
  data: CreatePaymentUrlRequest,
): Promise<{ paymentUrl: string }> {
  return apiRequest('/api/Payments/create-url', { method: 'POST', body: data });
}

/**
 * Redirects the user to the VNPAY payment page.
 * Convenience wrapper around createPaymentUrl.
 */
export async function redirectToVNPAY(orderId: number): Promise<void> {
  const { paymentUrl } = await createPaymentUrl({ orderID: orderId });
  window.location.href = paymentUrl;
}

/**
 * [Admin] Returns all payment records.
 */
export async function getAllPayments(): Promise<PaymentDto[]> {
  return apiRequest('/api/Payments');
}

/**
 * The VNPAY callback is handled server-side at GET /api/Payments/vnpay-callback.
 * VNPAY redirects to this endpoint after payment. The backend then redirects
 * the browser to either:
 *   /payment/success?orderId={id}   on success
 *   /payment/failed?code={code}     on failure
 *
 * No client-side call needed — just handle the redirect destination routes.
 */
