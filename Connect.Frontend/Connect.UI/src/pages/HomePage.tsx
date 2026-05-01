import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';



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

export default function HomePage() {
  const { products, productsLoading, loadProducts, addToCart, user,
          currentPage, totalPages, totalProducts, pageSize, loadProfile } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback tokens from URL (check both search and hash, and different naming conventions)
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    
    const accessToken = searchParams.get('accessToken') || searchParams.get('access_token') || searchParams.get('token') || hashParams.get('accessToken') || hashParams.get('access_token') || hashParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token') || hashParams.get('refreshToken') || hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (loadProfile) {
        loadProfile();
      }
    }
    
    loadProducts(1);
  }, [loadProducts, loadProfile]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    loadProducts(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen">
      {/* Mega Banner */}
      <div className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] flex justify-center bg-transparent mt-4 mb-20 px-4 md:px-8">
        <div className="absolute inset-4 md:inset-8 z-0 rounded-[40px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.08)] bg-white">
          <img 
            src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=2500" 
            alt="MacBook Pro" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 animate-slow-zoom origin-top"
          />
          {/* Sophisticated inner gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-white/10 to-transparent mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95"></div>
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[40px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-end pb-24 text-center px-4 w-full h-full pointer-events-none">
          <div className="glass-panel p-10 md:p-14 max-w-3xl w-full flex flex-col items-center shadow-[0_24px_48px_rgba(0,0,0,0.06)] relative overflow-hidden pointer-events-auto group">
            {/* Shimmer effect inside card */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h1 className="text-apple-hero mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/70 drop-shadow-sm font-bold relative z-10">Welcome to Connect.</h1>
            <p className="text-apple-display-md text-ink/80 font-medium mb-10 relative z-10 text-balance">Được phát triển bởi Đạt Nguyễn</p>
            <div className="flex items-center gap-6 mt-4 relative z-10">
              <Link to="/category/All" className="btn-primary px-10 py-4 font-semibold text-[17px] flex items-center justify-center">
                Mua ngay
              </Link>
              <Link to="/category/All" className="text-[17px] text-ink font-semibold hover:text-primary transition-colors flex items-center gap-1 hover-group">
                Tìm hiểu thêm <span className="text-[14px] hover-group-hover:translate-x-1 transition-transform">›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {productsLoading && products.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && products.length === 0 && (
          <div className="text-center py-20 text-ink-muted">
            <p className="text-apple-body-strong mb-2">Chưa có sản phẩm nào</p>
            <p>Hãy quay lại sau nhé.</p>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(product => (
            <Link to={`/product/${product.productID}`} key={product.productID} className="group glass-panel overflow-hidden relative flex flex-col h-full">
              
              <div className="h-64 overflow-hidden bg-white/60">
                <img 
                  src={product.imageURL?.[0] || 'https://via.placeholder.com/400?text=No+Image'} 
                  alt={product.productName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
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
              Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalProducts)} trong {totalProducts} sản phẩm
            </p>

            {/* Page controls */}
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-full glass-btn disabled:opacity-30 transition-all"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-ink-muted">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${
                      p === currentPage
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
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full glass-btn disabled:opacity-30 transition-all"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
