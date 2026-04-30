import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { products, addToCart } = useAppContext();
  
  const [priceRange, setPriceRange] = useState<number>(100000000);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedRom, setSelectedRom] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Derive filter options based on products in category
  const categoryProducts = category && category !== 'All' 
    ? products.filter(p => p.category === category)
    : products;

  const allRams = Array.from(new Set(categoryProducts.flatMap(p => p.ramOptions || []))) as string[];
  const allRoms = Array.from(new Set(categoryProducts.flatMap(p => p.romOptions || []))) as string[];
  const allColors = Array.from(new Set(categoryProducts.flatMap(p => p.colorOptions || []))) as string[];

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (list.includes(val)) {
      setList(list.filter(item => item !== val));
    } else {
      setList([...list, val]);
    }
  };

  const filteredProducts = categoryProducts.filter(p => 
    p.salePrice <= priceRange &&
    (selectedRam.length === 0 || p.ramOptions?.some(r => selectedRam.includes(r))) &&
    (selectedRom.length === 0 || p.romOptions?.some(r => selectedRom.includes(r))) &&
    (selectedColors.length === 0 || p.colorOptions?.some(c => selectedColors.includes(c)))
  );

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

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-apple-body-strong mb-4 text-ink/80">Khoảng giá</h3>
        <p className="text-[14px] text-ink mb-2">Đến {priceRange.toLocaleString('vi-VN')} ₫</p>
        <input 
          type="range" 
          min="0" 
          max="100000000" 
          step="1000000" 
          value={priceRange} 
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {allRams.length > 0 && (
        <div>
          <h3 className="text-apple-body-strong mb-4 text-ink/80">RAM</h3>
          <div className="flex flex-wrap gap-2">
            {allRams.map(ram => (
              <button 
                key={ram} 
                onClick={() => toggleFilter(selectedRam, setSelectedRam, ram)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  selectedRam.includes(ram) 
                    ? 'glass-btn-active' 
                    : 'glass-btn'
                }`}
              >
                {ram}
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
                onClick={() => toggleFilter(selectedRom, setSelectedRom, rom)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  selectedRom.includes(rom) 
                    ? 'glass-btn-active' 
                    : 'glass-btn'
                }`}
              >
                {rom}
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
                onClick={() => toggleFilter(selectedColors, setSelectedColors, color)}
                className={`px-4 py-2 rounded-full text-[12px] ${
                  selectedColors.includes(color) 
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
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink/10">
        <h1 className="text-apple-display-md">{category === 'All' || !category ? 'Tất cả sản phẩm' : `Mua ${category}`}</h1>
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
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">
              <p className="text-apple-body-strong mb-2">Không tìm thấy sản phẩm</p>
              <p>Hãy thử thay đổi bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="group glass-panel p-6 relative flex flex-col h-full">
                  
                  <div className="aspect-square mb-6 flex items-center justify-center p-4">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.05)]" />
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
          )}
        </div>
      </div>
    </div>
  );
}
