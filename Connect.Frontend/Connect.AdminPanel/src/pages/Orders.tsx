import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { Loader2 } from 'lucide-react';
import {
  getAllOrders,
  updateOrderStatusToShipping,
  updateOrderStatusToComplete,
  markOrderAsPaid,
  cancelOrder,
  OrderDto,
} from '../api';

export function Orders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const handleUpdateStatus = async (id: number, currentStatus: string, newStatus: string) => {
    if (newStatus === currentStatus) return;
    setUpdatingId(id);
    try {
      if (newStatus === 'Shipping') {
        await updateOrderStatusToShipping(id, newStatus);
      } else if (newStatus === 'Completed') {
        await updateOrderStatusToComplete(id, newStatus);
      } else if (newStatus === 'Cancelled') {
        await cancelOrder(id);
      } else {
        console.warn(`Status transition to "${newStatus}" is not supported via API.`);
        return;
      }
      await fetchOrders();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePayment = async (id: number, currentStatus: string, newPaymentStatus: string) => {
    if (newPaymentStatus === currentStatus) return;
    setUpdatingId(id);
    try {
      await markOrderAsPaid(id, newPaymentStatus);
      await fetchOrders();
    } catch (error: any) {
      console.error('Failed to update payment status:', error);
      alert(`Failed to update payment status: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadgeVariant = (s: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (s) {
      case 'Pending':     return 'default';
      case 'Processing':  return 'warning';
      case 'Shipping':    return 'info';
      case 'Completed':   return 'success';
      case 'Cancelled':   return 'danger';
      default:            return 'default';
    }
  };

  const paymentBadgeVariant = (s: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (s) {
      case 'Paid':    return 'success';
      case 'Pending': return 'warning';
      case 'Unpaid':  return 'danger';
      default:        return 'default';
    }
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
              <TableCell isHeader>Order Status</TableCell>
              <TableCell isHeader>Payment Status</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const isUpdating = updatingId === order.orderID;
              return (
                <TableRow key={order.orderID}>
                  <TableCell className="font-mono text-xs text-gray-500 font-medium">
                    #{order.orderID}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    User #{order.userID}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.orderFinalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <Select
                        className="py-1 px-2 text-xs w-36"
                        value={order.orderStatus}
                        disabled={isUpdating || order.orderStatus === 'Cancelled' || order.orderStatus === 'Completed'}
                        onChange={(e) =>
                          handleUpdateStatus(order.orderID, order.orderStatus, e.target.value)
                        }
                        options={[
                          { label: 'Pending',    value: 'Pending' },
                          { label: 'Processing', value: 'Processing' },
                          { label: 'Shipping',   value: 'Shipping' },
                          { label: 'Completed',  value: 'Completed' },
                          { label: 'Cancelled',  value: 'Cancelled' },
                        ]}
                      />
                      <Badge variant={statusBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <Select
                        className="py-1 px-2 text-xs w-36"
                        value={order.orderPaymentStatus}
                        disabled={isUpdating || order.orderPaymentStatus === 'Paid'}
                        onChange={(e) =>
                          handleUpdatePayment(order.orderID, order.orderPaymentStatus, e.target.value)
                        }
                        options={[
                          { label: 'Unpaid',  value: 'Unpaid' },
                          { label: 'Pending', value: 'Pending' },
                          { label: 'Paid',    value: 'Paid' },
                        ]}
                      />
                      <Badge variant={paymentBadgeVariant(order.orderPaymentStatus)}>
                        {order.orderPaymentStatus}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}