import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

export default function HomePage() {
  const { products, addToCart } = useAppContext();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: Math.random().toString(),
      productId: product.id,
      name: product.name,
      image: product.images[0],
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      quantity: 1,
      selectedColor: product.colorOptions?.[0],
      selectedRam: product.ramOptions?.[0],
      selectedRom: product.romOptions?.[0],
    });
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

            <h1 className="text-apple-hero mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/70 drop-shadow-sm font-bold relative z-10">MacBook Pro</h1>
            <p className="text-apple-display-md text-ink/80 font-medium mb-10 relative z-10 text-balance">Mind-blowing. Head-turning.</p>
            <div className="flex items-center gap-6 mt-4 relative z-10">
              <Link to="/product/p2" className="btn-primary px-10 py-4 font-semibold text-[17px] flex items-center justify-center">
                Mua ngay
              </Link>
              <Link to="/product/p2" className="text-[17px] text-ink font-semibold hover:text-primary transition-colors flex items-center gap-1 hover-group">
                Tìm hiểu thêm <span className="text-[14px] hover-group-hover:translate-x-1 transition-transform">›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="group glass-panel p-6 relative flex flex-col h-full">
              
              <div className="aspect-square mb-6 flex items-center justify-center p-4">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="flex-1 flex flex-col">
                {product.isAppleVerified && (
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-[#c96211] mb-2">
                    <CheckCircle2 size={12} /> Connect Xác minh
                  </div>
                )}
                
                <h3 className="text-apple-body-strong text-ink mb-1 line-clamp-2">{product.name}</h3>
                <div className="text-[12px] text-ink-muted mb-4">Đã bán: {product.soldAmount.toLocaleString('vi-VN')} • Kho: {product.stock > 0 ? product.stock : 'Hết hàng'}</div>
                
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    {product.salePrice < product.originalPrice && (
                      <span className="text-[12px] text-ink-muted line-through block decoration-1">
                        {product.originalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                    <span className="text-apple-body text-ink">
                      {product.salePrice.toLocaleString('vi-VN')} ₫
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
