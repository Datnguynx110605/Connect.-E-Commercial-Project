
import { apiRequest } from './client';
import { PaymentDto, CreatePaymentUrlRequest } from './types';

export async function createPaymentUrl(
  data: CreatePaymentUrlRequest,
): Promise<{ paymentUrl: string }> {
  return apiRequest('/api/Payments/create-paymenturl', { method: 'POST', body: data });
}

export async function redirectToVNPAY(orderId: number): Promise<void> {
  const { paymentUrl } = await createPaymentUrl({ orderID: orderId });
  window.location.href = paymentUrl;
}

