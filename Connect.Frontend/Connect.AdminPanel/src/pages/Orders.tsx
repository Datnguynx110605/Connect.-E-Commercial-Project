import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

interface Order {
  orderID: number;
  userID: number;
  couponID: number | null;
  orderTotalItems: number;
  orderTotalItemPrice: number;
  orderFinalPrice: number;
  orderShippingMethod: string;
  orderPaymentMethod: string;
  orderPaymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchId, setSearchId] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const { fetchApi } = await import('../lib/api');
        const data = await fetchApi('/api/orders/getall-order?page=1&pageSize=50');
        setOrders(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filtered = orders.filter(o => 
    o.orderID.toString().includes(searchId) &&
    o.userID.toString().includes(searchUser)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipping': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Unpaid': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Pending': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Đơn hàng" 
                value={searchId} onChange={e => setSearchId(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Người dùng" 
                value={searchUser} onChange={e => setSearchUser(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID Đơn Hàng</th>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái Giao hàng</th>
              <th className="px-6 py-4">Trạng thái Thanh toán</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(o => (
              <tr key={o.orderID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-slate-700">{o.orderID}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{o.userID}</td>
                <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(o.orderFinalPrice)}</td>
                <td className="px-6 py-4">
                  <select value={o.orderStatus} readOnly className={`text-xs font-medium px-2 py-1 rounded-md outline-none cursor-pointer appearance-none pr-8 relative bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] ${getStatusColor(o.orderStatus)}`}>
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Processing">Đang chuẩn bị</option>
                    <option value="Shipping">Đang giao</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select value={o.orderPaymentStatus} readOnly className={`text-xs font-medium px-2 py-1 rounded-md border outline-none cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] ${getPaymentColor(o.orderPaymentStatus)}`}>
                    <option value="Unpaid">Chưa thanh toán</option>
                    <option value="Pending">Chờ thanh toán</option>
                    <option value="Paid">Đã thanh toán</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
