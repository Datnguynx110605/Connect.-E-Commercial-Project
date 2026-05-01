import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface Product {
  productID: number;
  categoryID: number;
  productName: string;
  description: string;
  originalPrice: number;
  finalPrice: number;
  stock: number;
  ram: number;
  rom: number;
  color: string;
  imageURL: string[];
  productStatus: string;
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

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<Product>, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });
  
  const [searchId, setSearchId] = useState('');
  const [searchCat, setSearchCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state for Create
  const [formData, setFormData] = useState({
    productName: '',
    categoryID: 0,
    description: '',
    originalPrice: 0,
    finalPrice: 0,
    stock: 0,
    ram: 0,
    rom: 0,
    color: '',
    imageURL: '' // newline separated
  });

  // Form state for Edit (Stock & Images)
  const [editFormData, setEditFormData] = useState({
    stockToAdd: 0,
    imageURL: '' // newline separated
  });

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const data: PagedResult<Product> = await fetchApi(`/api/products/getall-product?page=${page}&pageSize=10`);
      setProducts(data.items || []);
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
    loadProducts();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadProducts(newPage);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        ...formData,
        imageURL: formData.imageURL.split('\n').filter(url => url.trim() !== '')
      };

      // API says multipart/form-data but example is JSON. 
      // Usually in these projects, JSON is preferred if implemented this way.
      // We'll use FormData to be safe as per "Content-Type: multipart/form-data" requirement.
      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'imageURL') {
          (value as string[]).forEach(v => fd.append('imageURL', v));
        } else {
          fd.append(key, value.toString());
        }
      });

      await fetchApi('/api/products/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Overriding because our fetchApi defaults to JSON and the example shows JSON.
        body: JSON.stringify(payload),
      });

      await loadProducts();
      setShowCreateModal(false);
      setFormData({
        productName: '',
        categoryID: 0,
        description: '',
        originalPrice: 0,
        finalPrice: 0,
        stock: 0,
        ram: 0,
        rom: 0,
        color: '',
        imageURL: ''
      });
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setSubmitting(true);

      // Update stock if > 0 (additive)
      if (editFormData.stockToAdd > 0) {
        await fetchApi(`/api/products/${editingProduct.productID}/update-stock`, {
          method: 'PATCH',
          body: JSON.stringify({ stock: editFormData.stockToAdd }),
        });
      }

      // Update images if changed
      const newImages = editFormData.imageURL.split('\n').filter(url => url.trim() !== '');
      if (JSON.stringify(newImages) !== JSON.stringify(editingProduct.imageURL)) {
         await fetchApi(`/api/products/${editingProduct.productID}/update-image`, {
            method: 'PATCH',
            body: JSON.stringify({ imageURL: newImages }),
         });
      }

      await loadProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await fetchApi(`/api/products/${id}/delete-product`, {
        method: 'DELETE',
      });
      await loadProducts();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      stockToAdd: 0,
      imageURL: product.imageURL.join('\n')
    });
    setShowEditModal(true);
  };

  const filteredProducts = products.filter(p => 
    p.productID.toString().includes(searchId) &&
    p.categoryID.toString().includes(searchCat)
  );

  if (loading && products.length === 0) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error && products.length === 0) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Sản phẩm" 
                value={searchId} onChange={e => setSearchId(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Tìm theo ID Danh mục" 
                value={searchCat} onChange={e => setSearchCat(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Sản phẩm
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Danh mục</th>
              <th className="px-6 py-4">Giá bán / Giá gốc</th>
              <th className="px-6 py-4">Kho</th>
              <th className="px-6 py-4">Thuộc tính</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.productID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{product.productID}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{product.productName}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{product.categoryID}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-red-600">{formatCurrency(product.finalPrice)}</div>
                  <div className="text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {product.ram}GB / {product.rom}GB <br/> {product.color}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Cập nhật Số lượng/Ảnh"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.productID)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Không tìm thấy sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                 <h3 className="text-lg font-bold text-slate-900">Thêm Sản phẩm mới</h3>
                 <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm</label>
                        <input type="text" required value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID Danh mục</label>
                        <input type="number" required value={formData.categoryID} onChange={e => setFormData({...formData, categoryID: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Giá gốc (VND)</label>
                        <input type="number" required value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Giá bán (VND)</label>
                        <input type="number" required value={formData.finalPrice} onChange={e => setFormData({...formData, finalPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kho</label>
                        <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Màu sắc</label>
                        <input type="text" required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">RAM (GB)</label>
                        <input type="number" required value={formData.ram} onChange={e => setFormData({...formData, ram: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ROM (GB)</label>
                        <input type="number" required value={formData.rom} onChange={e => setFormData({...formData, rom: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                      <textarea rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Links Hình ảnh (Mỗi link một dòng)</label>
                      <textarea rows={3} required value={formData.imageURL} onChange={e => setFormData({...formData, imageURL: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                   </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
                   <button type="submit" disabled={submitting} className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                     {submitting ? 'Đang thêm...' : 'Thêm sản phẩm'}
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Edit Modal (Stock/Image) */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-900">Cập nhật: {editingProduct.productName}</h3>
                 <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="p-6 space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Thêm số lượng vào kho (Hiện tại: {editingProduct.stock})</label>
                      <input type="number" min="0" value={editFormData.stockToAdd} onChange={e => setEditFormData({...editFormData, stockToAdd: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <p className="mt-1 text-xs text-slate-400">* Số lượng này sẽ được cộng thêm vào kho hiện tại.</p>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cập nhật Links Hình ảnh</label>
                      <textarea rows={5} value={editFormData.imageURL} onChange={e => setEditFormData({...editFormData, imageURL: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                   </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                   <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
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

