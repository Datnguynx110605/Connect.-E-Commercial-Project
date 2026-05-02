import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface Cart {
  cartID: number;
  userID: number;
  productID: number;
  cartQuantity: number;
  cartUnitPrice: number;
  cartTotalPrice: number;
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

export function Carts() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Cart>, 'items'>>({
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

  const loadCarts = async (page = 1) => {
    try {
      setLoading(true);
      const data: PagedResult<Cart> = await fetchApi(`/api/carts/getall-cart?page=${page}&pageSize=10`);
      setCarts(data?.items || []);
      setPagination({
        totalCount: data?.totalCount || 0,
        page: data?.page || 1,
        pageSize: data?.pageSize || 10,
        totalPages: data?.totalPages || 0,
        hasNext: data?.hasNext || false,
        hasPrevious: data?.hasPrevious || false
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadCarts(newPage);
  };

  const filtered = carts.filter(c => 
    c.cartID.toString().includes(searchId) &&
    c.userID.toString().includes(searchUser)
  );

  if (loading && carts.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;
  // Removed error blocking to allow access even when API fails (e.g. data uncreated)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Giỏ hàng" 
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
              <th className="px-6 py-4">ID Giỏ hàng</th>
              <th className="px-6 py-4">ID Người dùng</th>
              <th className="px-6 py-4">ID Sản phẩm</th>
              <th className="px-6 py-4">Số lượng Món</th>
              <th className="px-6 py-4">Đơn giá</th>
              <th className="px-6 py-4">Tổng giá trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.cartID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{c.cartID}</td>
                <td className="px-6 py-4 font-mono text-slate-600">{c.userID}</td>
                <td className="px-6 py-4 font-mono text-slate-600">{c.productID}</td>
                <td className="px-6 py-4 text-slate-900">{c.cartQuantity}</td>
                <td className="px-6 py-4 font-medium text-slate-600">{formatCurrency(c.cartUnitPrice)}</td>
                <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(c.cartTotalPrice)}</td>
              </tr>
            ))}
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
