import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Loader2 } from 'lucide-react';
import { getAllPayments, PaymentDto } from '../api';

export function Payments() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const data = await getAllPayments();
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments History</h1>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>Transaction ID</TableCell>
              <TableCell isHeader>Order ID</TableCell>
              <TableCell isHeader>Method</TableCell>
              <TableCell isHeader>Amount</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Date</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.paymentID}>
                <TableCell className="font-mono text-xs font-semibold text-gray-700">{payment.transactionID || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs text-gray-500">#{payment.orderID}</TableCell>
                <TableCell className="text-gray-900 font-medium">{payment.paymentType}</TableCell>
                <TableCell className="font-medium">${payment.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={payment.isPaidSuccess ? 'success' : 'danger'}>{payment.isPaidSuccess ? 'Completed' : 'Failed'}</Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{new Date(payment.paidAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
