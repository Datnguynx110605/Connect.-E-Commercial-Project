import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface OrderItem {
  productID: number;
  unitPrice: number;
  quantity: number;
}

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
  orderItems: OrderItem[];
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Order>, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [searchId, setSearchId] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResult<Order> = await fetchApi(`/api/orders/getall-order?page=${page}&pageSize=10`);
      setOrders(data.items || []);
      setPagination({
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadOrders(newPage);
  };

  const handleStatusChange = async (orderId: number, currentStatus: string, newStatus: string, paymentStatus: string) => {
    if (newStatus === currentStatus) return;

    try {
      if (newStatus === 'Shipping') {
        if (currentStatus === 'Cancelled') {
          alert('Không thể chuyển trạng thái cho đơn hàng đã hủy.');
          return;
        }
        await fetchApi(`/api/orders/${orderId}/update-statustoshipping`, {
          method: 'PATCH',
          body: JSON.stringify({ orderStatus: 'Shipping' }),
        });
      } else if (newStatus === 'Completed') {
        if (currentStatus === 'Cancelled') {
          alert('Đơn hàng đã hủy không thể hoàn thành.');
          return;
        }
        if (paymentStatus === 'Unpaid') {
          alert('Đơn hàng phải được thanh toán trước khi hoàn thành.');
          return;
        }
        await fetchApi(`/api/orders/${orderId}/update-statustocompleted`, {
          method: 'PATCH',
          body: JSON.stringify({ orderStatus: 'Completed' }),
        });
      } else {
        alert('Trạng thái này không thể cập nhật thủ công qua các endpoint admin hiện tại.');
        return;
      }
      await loadOrders();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handlePaymentStatusChange = async (orderId: number, currentPaymentStatus: string, newPaymentStatus: string, orderStatus: string) => {
    if (newPaymentStatus === currentPaymentStatus) return;

    if (newPaymentStatus === 'Paid') {
      if (orderStatus === 'Cancelled') {
        alert('Không thể thanh toán cho đơn hàng đã hủy.');
        return;
      }
      try {
        await fetchApi(`/api/orders/${orderId}/markas-paid`, {
          method: 'PATCH',
          body: JSON.stringify({ orderPaymentStatus: 'Paid' }),
        });
        await loadOrders();
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
      }
    } else {
      alert('Chỉ có thể đánh dấu đã thanh toán (Paid) thủ công.');
    }
  };

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

  if (loading && orders.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error && orders.length === 0) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

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
              <th className="px-6 py-4">Chi tiết món</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Hình thức</th>
              <th className="px-6 py-4">Trạng thái Giao hàng</th>
              <th className="px-6 py-4">Trạng thái Thanh toán</th>
              <th className="px-6 py-4">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(o => (
              <tr key={o.orderID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-slate-700">{o.orderID}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{o.userID}</td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600 space-y-1">
                    {(o.orderItems || (o as any).OrderItems || (o as any).items)?.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="font-mono text-blue-600">#{item.productID || item.productId}</span>
                        <span>x{item.quantity}</span>
                        <span className="text-slate-400">({formatCurrency(item.unitPrice || item.price)})</span>
                      </div>
                    ))}
                    {(!o.orderItems && !(o as any).OrderItems && !(o as any).items || 
                      (o.orderItems?.length === 0 && !(o as any).OrderItems && !(o as any).items) ||
                      ((o as any).OrderItems?.length === 0 && !o.orderItems && !(o as any).items) ||
                      ((o as any).items?.length === 0 && !o.orderItems && !(o as any).OrderItems)) && 
                      <span className="text-slate-400">Không có dữ liệu món</span>}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(o.orderFinalPrice)}</td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-slate-700">{o.orderShippingMethod}</div>
                    <div className="text-slate-500">{o.orderPaymentMethod}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={o.orderStatus} 
                    onChange={(e) => handleStatusChange(o.orderID, o.orderStatus, e.target.value, o.orderPaymentStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded-md outline-none cursor-pointer appearance-none pr-8 relative bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] ${getStatusColor(o.orderStatus)}`}
                  >
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Processing" disabled>Đang chuẩn bị</option>
                    <option value="Shipping">Đang giao</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled" disabled>Đã hủy</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={o.orderPaymentStatus} 
                    onChange={(e) => handlePaymentStatusChange(o.orderID, o.orderPaymentStatus, e.target.value, o.orderStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded-md border outline-none cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] ${getPaymentColor(o.orderPaymentStatus)}`}
                  >
                    <option value="Unpaid">Chưa thanh toán</option>
                    <option value="Pending" disabled>Chờ thanh toán</option>
                    <option value="Paid">Đã thanh toán</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

