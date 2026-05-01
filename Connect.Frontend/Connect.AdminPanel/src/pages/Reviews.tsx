import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface Review {
  reviewID: number;
  productID: number;
  userID: number;
  rating: number;
  body: string;
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

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Review>, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [searchId, setSearchId] = useState('');
  const [searchProd, setSearchProd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true);
      const data: PagedResult<Review> = await fetchApi(`/api/reviews/getall-review?page=${page}&pageSize=10`);
      setReviews(data.items || []);
      setPagination({
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadReviews(newPage);
  };

  const filtered = reviews.filter(r => 
    r.reviewID.toString().includes(searchId) &&
    r.productID.toString().includes(searchProd)
  );

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Đánh giá" 
                value={searchId} onChange={e => setSearchId(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Sản phẩm" 
                value={searchProd} onChange={e => setSearchProd(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID Đánh giá</th>
              <th className="px-6 py-4">ID Sản phẩm</th>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Đánh giá</th>
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(r => (
              <tr key={r.reviewID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{r.reviewID}</td>
                <td className="px-6 py-4 font-mono text-slate-600">{r.productID}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{r.userID}</td>
                <td className="px-6 py-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={r.body}>{r.body}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(r.createdAt)}</td>
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
