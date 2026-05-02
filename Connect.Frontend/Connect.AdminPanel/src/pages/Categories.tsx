import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface Category {
  categoryID: number;
  categoryName: string;
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

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Category>, 'items'>>({
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async (page = 1) => {
    try {
      setLoading(true);
      const data: PagedResult<Category> = await fetchApi(`/api/categories/getall-category?page=${page}&pageSize=10`);
      setCategories(data?.items || []);
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
    loadCategories();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadCategories(newPage);
  };

  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.categoryName : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setSubmitting(true);
      if (editingCategory) {
        await fetchApi(`/api/categories/${editingCategory.categoryID}/update-category`, {
          method: 'PUT',
          body: JSON.stringify({ categoryName }),
        });
      } else {
        await fetchApi('/api/categories/create-category', {
          method: 'POST',
          body: JSON.stringify({ categoryName }),
        });
      }
      await loadCategories();
      handleCloseModal();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      await fetchApi(`/api/categories/${id}/delete-category`, {
        method: 'DELETE',
      });
      await loadCategories();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };
  
  const filtered = categories.filter(c => c.categoryName.toLowerCase().includes(search.toLowerCase()));

  if (loading && categories.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;
  // Removed error blocking to allow access even when API fails (e.g. data uncreated)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Tìm tên danh mục" 
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Danh mục
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID Danh mục</th>
              <th className="px-6 py-4">Tên Danh mục</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(cat => (
              <tr key={cat.categoryID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{cat.categoryID}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{cat.categoryName}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Đổi tên"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.categoryID)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Không tìm thấy danh mục nào.
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên danh mục
                </label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập tên danh mục (ví dụ: Smartphones)"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Tên danh mục từ 2-20 ký tự, không chứa ký tự đặc biệt.
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang lưu...' : (editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

