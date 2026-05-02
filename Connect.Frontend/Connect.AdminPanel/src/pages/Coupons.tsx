import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface Coupon {
  couponID: number;
  couponCode: string;
  discountAmount: number;
  couponQuantity: number;
  minimumPriceRequired: number; // For reading from response
  expiryDate: string;
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

export function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Coupon>, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state for Create
  const [formData, setFormData] = useState({
    couponCode: '',
    discountAmount: 0,
    couponQuantity: 0,
    mimimumPriceRequired: 0, // Using 'mimimum' for request as per API
    expiryDate: ''
  });

  // Form state for Update
  const [updateData, setUpdateData] = useState({
    couponQuantity: 0,
    expiryDate: ''
  });

  const loadCoupons = async (page = 1) => {
    try {
      setLoading(true);
      const data: PagedResult<Coupon> = await fetchApi(`/api/coupons/getall-coupon?page=${page}&pageSize=10`);
      setCoupons(data?.items || []);
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
    loadCoupons();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadCoupons(newPage);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // API expects ISO string for date
      const body = {
        ...formData,
        expiryDate: new Date(formData.expiryDate).toISOString()
      };
      await fetchApi('/api/coupons/create-coupon', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await loadCoupons();
      setIsModalOpen(false);
      setFormData({
        couponCode: '',
        discountAmount: 0,
        couponQuantity: 0,
        mimimumPriceRequired: 0,
        expiryDate: ''
      });
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    try {
      setSubmitting(true);
      
      // Update Quantity if changed (it's additive in API)
      const quantityToAdd = updateData.couponQuantity - editingCoupon.couponQuantity;
      if (quantityToAdd > 0) {
        await fetchApi(`/api/coupons/${editingCoupon.couponID}/update-quantity`, {
          method: 'PATCH',
          body: JSON.stringify({ couponQuantity: quantityToAdd }),
        });
      }

      // Update Expiry Date if changed
      if (updateData.expiryDate !== editingCoupon.expiryDate.split('T')[0]) {
        await fetchApi(`/api/coupons/${editingCoupon.couponID}/update-expiry-date`, {
          method: 'PATCH',
          body: JSON.stringify({ expiryDate: new Date(updateData.expiryDate).toISOString() }),
        });
      }

      await loadCoupons();
      setIsEditModalOpen(false);
      setEditingCoupon(null);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setUpdateData({
      couponQuantity: coupon.couponQuantity,
      expiryDate: coupon.expiryDate.split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const filtered = coupons.filter(c => c.couponCode.toLowerCase().includes(search.toLowerCase()));

  if (loading && coupons.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;
  // Removed error blocking to allow access even when API fails (e.g. data uncreated)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Tìm mã giảm giá" 
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Mã giảm giá
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Mã</th>
              <th className="px-6 py-4">Mức giảm</th>
              <th className="px-6 py-4">Đơn tối thiểu</th>
              <th className="px-6 py-4">Số lượng</th>
              <th className="px-6 py-4">Ngày hết hạn</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(cp => (
              <tr key={cp.couponID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">{cp.couponCode}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">-{formatCurrency(cp.discountAmount)}</td>
                <td className="px-6 py-4 text-slate-600">{formatCurrency(cp.minimumPriceRequired)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {cp.couponQuantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(cp.expiryDate)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => openEditModal(cp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Cập nhật Số lượng/Ngày Hết hạn"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Thêm Mã giảm giá mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã Coupon</label>
                  <input type="text" required value={formData.couponCode} onChange={e => setFormData({...formData, couponCode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="SAVE10K" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền giảm (VND)</label>
                    <input type="number" required value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                    <input type="number" required value={formData.couponQuantity} onChange={e => setFormData({...formData, couponQuantity: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn tối thiểu (VND)</label>
                  <input type="number" required value={formData.mimimumPriceRequired} onChange={e => setFormData({...formData, mimimumPriceRequired: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hết hạn</label>
                  <input type="date" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? 'Đang tạo...' : 'Tạo Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Cập nhật Coupon: {editingCoupon.couponCode}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng hiện tại: {editingCoupon.couponQuantity}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Thành:</span>
                    <input type="number" required min={editingCoupon.couponQuantity} value={updateData.couponQuantity} onChange={e => setUpdateData({...updateData, couponQuantity: Number(e.target.value)})} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">* Chỉ có thể tăng thêm số lượng.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hết hạn</label>
                  <input type="date" required value={updateData.expiryDate} onChange={e => setUpdateData({...updateData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

