import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

export default function HomePage() {
  const { products, productsLoading, loadProducts, addToCart, user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts(1, 20);
  }, [loadProducts]);

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

            <h1 className="text-apple-hero mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/70 drop-shadow-sm font-bold relative z-10">Chào mừng đến với Connect.</h1>
            <p className="text-apple-display-md text-ink/80 font-medium mb-10 relative z-10 text-balance">Connect. là một dự án được phát triển bởi Nguyễn Tiến Đạt</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
      </div>
    </div>
  );
}
