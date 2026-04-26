import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { Loader2 } from 'lucide-react';
import { getAllOrders, updateOrderStatusToShipping, updateOrderStatusToComplete, markOrderAsPaid, OrderDto } from '../api';

export function Orders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      if (newStatus === 'Shipping') {
        await updateOrderStatusToShipping(id, newStatus);
      } else if (newStatus === 'Completed') {
        await updateOrderStatusToComplete(id, newStatus);
      }
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUpdatePayment = async (id: number, newPaymentStatus: string) => {
    try {
      await markOrderAsPaid(id, newPaymentStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'Processing') return 'warning';
    if (s === 'Shipping') return 'info';
    if (s === 'Completed') return 'success';
    if (s === 'Cancelled') return 'danger';
    return 'default';
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>Order ID</TableCell>
              <TableCell isHeader>Customer ID</TableCell>
              <TableCell isHeader>Date</TableCell>
              <TableCell isHeader>Total</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Payment</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderID}>
                <TableCell className="font-mono text-xs text-gray-500 font-medium">#{order.orderID}</TableCell>
                <TableCell className="font-medium text-gray-900">User #{order.userID}</TableCell>
                <TableCell className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">${order.orderFinalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Select 
                    className="py-1 px-2 text-xs w-32" 
                    value={order.orderStatus} 
                    onChange={e => handleUpdateStatus(order.orderID, e.target.value)}
                    options={[
                      { label: 'Pending', value: 'Pending' },
                      { label: 'Processing', value: 'Processing' },
                      { label: 'Shipping', value: 'Shipping' },
                      { label: 'Completed', value: 'Completed' },
                      { label: 'Cancelled', value: 'Cancelled' }
                    ]}
                  />
                  <div className="mt-2"><Badge variant={statusBadge(order.orderStatus) as any}>{order.orderStatus}</Badge></div>
                </TableCell>
                <TableCell>
                  <Select 
                    className="py-1 px-2 text-xs w-32" 
                    value={order.orderPaymentStatus} 
                    onChange={e => handleUpdatePayment(order.orderID, e.target.value)}
                    options={[
                      { label: 'Paid', value: 'Paid' },
                      { label: 'Unpaid', value: 'Unpaid' },
                      { label: 'Pending', value: 'Pending' }
                    ]}
                  />
                  <div className="mt-2 text-xs font-medium text-gray-500">{order.orderPaymentStatus}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
