import { apiRequest } from './client';
import { OrderDto, CreateOrderRequest } from './types';

export async function getOrderHistory(): Promise<OrderDto[]> {
  return apiRequest('/api/Orders/get-orderhistory');
}

export async function createOrder(data: CreateOrderRequest): Promise<OrderDto> {
  return apiRequest('/api/Orders/create-order', { method: 'POST', body: data });
}

export async function cancelOrder(orderId: number): Promise<OrderDto> {
  return apiRequest(`/api/Orders/${orderId}/cancel-order`, { method: 'PATCH' });
}
