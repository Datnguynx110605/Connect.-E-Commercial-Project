import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product, Category } from '../types';
import { productsApi, categoriesApi } from '../services/api';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { addToCart, user, categories } = useAppContext();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (current > 4) pages.push('...');
    const start = Math.max(2, current - 2);
    const end   = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 3) pages.push('...');
    pages.push(total);
    return pages;
  }

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filters
  const [priceFrom, setPriceFrom] = useState<number>(0);
  const [priceTo, setPriceTo] = useState<number>(100000000);
  const [filterRam, setFilterRam] = useState<number | null>(null);
  const [filterRom, setFilterRom] = useState<number | null>(null);
  const [filterColor, setFilterColor] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Find category by name
  const matchedCategory = categories.find(
    (c) => c.categoryName.toLowerCase() === (category || '').toLowerCase()
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      
      if (category && category !== 'All' && matchedCategory) {
        result = await productsApi.getByCategory(matchedCategory.categoryID, page);
      } else {
        result = await productsApi.getAll(page);
      }
      
      setProducts(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setPageSize(result.pageSize);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, matchedCategory, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Client-side filter (applied on top of server-side category filter)
  const filteredProducts = products.filter(p => {
    if (p.finalPrice < priceFrom || p.finalPrice > priceTo) return false;
    if (filterRam !== null && p.ram !== filterRam) return false;
    if (filterRom !== null && p.rom !== filterRom) return false;
    if (filterColor && p.color.toLowerCase() !== filterColor.toLowerCase()) return false;
    return true;
  });

  // Derive filter options from loaded products
  const allRams = Array.from(new Set(products.map(p => p.ram))).sort((a, b) => a - b);
  const allRoms = Array.from(new Set(products.map(p => p.rom))).sort((a, b) => a - b);
  const allColors = Array.from(new Set(products.map(p => p.color))).filter(Boolean).sort();

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.productID, 1);
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const clearFilters = () => {
    setPriceFrom(0);
    setPriceTo(100000000);
    setFilterRam(null);
    setFilterRom(null);
    setFilterColor('');
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-apple-body-strong mb-4 text-ink/80">Khoảng giá</h3>
        <div className="flex gap-2 text-[13px]">
          <input 
            type="number"
            placeholder="Từ"
            value={priceFrom || ''}
            onChange={(e) => setPriceFrom(Number(e.target.value) || 0)}
            className="w-full px-2 py-1.5 bg-white/50 border border-white/50 rounded-[8px] text-[13px] focus:outline-none focus:border-primary"
          />
          <span className="text-ink-muted self-center">—</span>
          <input 
            type="number"
            placeholder="Đến"
            value={priceTo === 100000000 ? '' : priceTo}
            onChange={(e) => setPriceTo(Number(e.target.value) || 100000000)}
            className="w-full px-2 py-1.5 bg-white/50 border border-white/50 rounded-[8px] text-[13px] focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {allRams.length > 0 && (
        <div>
          <h3 className="text-apple-body-strong mb-4 text-ink/80">RAM</h3>
          <div className="flex flex-wrap gap-2">
            {allRams.map(ram => (
              <button 
                key={ram} 
                onClick={() => setFilterRam(filterRam === ram ? null : ram)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  filterRam === ram 
                    ? 'glass-btn-active' 
                    : 'glass-btn'
                }`}
              >
                {ram}GB
              </button>
            ))}
          </div>
        </div>
      )}

      {allRoms.length > 0 && (
        <div>
          <h3 className="text-apple-body-strong mb-4 text-ink/80">Dung lượng (ROM)</h3>
          <div className="flex flex-wrap gap-2">
            {allRoms.map(rom => (
              <button 
                key={rom} 
                onClick={() => setFilterRom(filterRom === rom ? null : rom)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  filterRom === rom 
                    ? 'glass-btn-active' 
                    : 'glass-btn'
                }`}
              >
                {rom}GB
              </button>
            ))}
          </div>
        </div>
      )}

      {allColors.length > 0 && (
        <div>
          <h3 className="text-apple-body-strong mb-4 text-ink/80">Màu sắc</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map(color => (
              <button 
                key={color} 
                onClick={() => setFilterColor(filterColor === color ? '' : color)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  filterColor === color 
                    ? 'glass-btn-active' 
                    : 'glass-btn'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={clearFilters}
        className="text-[13px] text-primary hover:underline"
      >
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <div>
          <h1 className="text-apple-display-md">{category === 'All' || !category ? 'Tất cả sản phẩm' : `Mua ${category}`}</h1>
          {!loading && <p className="text-[14px] text-ink-muted mt-1">{totalCount} sản phẩm</p>}
        </div>
        <button 
          className="md:hidden flex items-center gap-2 text-[14px] text-primary"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        >
          <Filter size={16} /> Bộ lọc
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-[80px] glass-panel p-6">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filter Toggle Area */}
        {isMobileFilterOpen && (
          <aside className="md:hidden mb-8 p-6 glass-panel rounded-[24px] shadow-lg sticky top-[50px] z-40 max-h-[80vh] overflow-y-auto">
             <FilterSidebar />
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">
              <p className="text-apple-body-strong mb-2">Không tìm thấy sản phẩm</p>
              <p>Hãy thử thay đổi bộ lọc của bạn.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <Link to={`/product/${product.productID}`} key={product.productID} className="group glass-panel overflow-hidden relative flex flex-col h-full">
                    
                    <div className="h-64 overflow-hidden bg-white/60">
                      <img 
                        src={product.imageURL?.[0] || 'https://via.placeholder.com/400?text=No+Image'} 
                        alt={product.productName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col p-5">
                      <h3 className="text-apple-body-strong text-ink mb-1 line-clamp-2">{product.productName}</h3>
                      <div className="text-[12px] text-ink-muted mb-2">
                        {product.color} • RAM: {product.ram}GB • ROM: {product.rom}GB
                      </div>
                      <div className="text-[12px] text-ink-muted mb-4">
                        {product.productStatus === 'InStock' ? `Kho: ${product.stock}` : 'Hết hàng'}
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-end justify-between">
                        <div>
                          {product.finalPrice < product.originalPrice && (
                            <span className="text-[12px] text-ink-muted line-through block decoration-1">
                              {product.originalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                          <span className="text-apple-body text-ink">
                            {product.finalPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                        
                        <button 
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock === 0}
                          className="w-10 h-10 rounded-full glass-btn p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Thêm vào giỏ"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-14 flex flex-col items-center gap-4">
                  {/* Item count */}
                  <p className="text-[13px] text-ink-muted">
                    Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} trong {totalCount} sản phẩm
                  </p>

                  {/* Page controls */}
                  <div className="flex items-center gap-2">
                    {/* Prev */}
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-full glass-btn disabled:opacity-30 transition-all"
                      aria-label="Trang trước"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers(page, totalPages).map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-ink-muted">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p as number)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${
                            p === page
                              ? 'bg-primary text-white shadow-md scale-110'
                              : 'glass-btn hover:scale-105'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-full glass-btn disabled:opacity-30 transition-all"
                      aria-label="Trang sau"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
