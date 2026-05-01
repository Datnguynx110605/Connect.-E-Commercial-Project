import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

interface Payment {
  paymentID: number;
  orderID: number;
  paymentType: string;
  transactionID: number;
  bankingInfo: string;
  totalAmount: number;
  isPaidSuccess: boolean;
  paidAt: string;
}

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const { fetchApi } = await import('../lib/api');
        const data = await fetchApi('/api/payments/getall-payment?page=1&pageSize=50');
        setPayments(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const filtered = payments.filter(p => 
    p.paymentID.toString().includes(search) ||
    p.transactionID.toString().includes(search) ||
    p.paymentType.toLowerCase().includes(search.toLowerCase()) ||
    p.bankingInfo.toLowerCase().includes(search.toLowerCase()) ||
    p.totalAmount.toString().includes(search)
  );

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-2xl">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Tìm kiếm theo ID, Mã GD, Số tiền, Loại thanh toán, Ngân hàng..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID Thanh toán</th>
              <th className="px-6 py-4">ID Đơn hàng</th>
              <th className="px-6 py-4">Mã Giao dịch (Txn)</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Hình thức</th>
              <th className="px-6 py-4">Ngân hàng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.paymentID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-slate-700">{p.paymentID}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{p.orderID}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{p.transactionID}</td>
                <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(p.totalAmount)}</td>
                <td className="px-6 py-4 text-slate-700">{p.paymentType}</td>
                <td className="px-6 py-4 text-slate-600">{p.bankingInfo}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.isPaidSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.isPaidSuccess ? 'Thành công' : 'Thất bại'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(p.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
