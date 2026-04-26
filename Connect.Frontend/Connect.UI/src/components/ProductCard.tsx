import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { ProductDto } from '../api/types';
import { formatVND, formatStorage } from '../data/mock';
import { useAppContext } from '../context/AppContext';

export const ProductCard: React.FC<{ product: ProductDto }> = ({ product }) => {
  const { addToCart } = useAppContext();

  const mainImage = product.imageURL[0] ?? '';
  const isOutOfStock = product.productStatus === 'OutOfStock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product.productID);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.productID}`} className="relative aspect-square overflow-hidden bg-gray-50 p-6 flex flex-col items-center justify-center">
        {isOutOfStock && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded text-white z-10 bg-gray-500">
            Hết hàng
          </span>
        )}
        {!isOutOfStock && product.finalPrice < product.originalPrice && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded text-white z-10 bg-red-500">
            Sale
          </span>
        )}
        <img
          src={mainImage}
          alt={product.productName}
          className="w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-1">
          {formatStorage(product.ram)} RAM · {formatStorage(product.rom)} ROM · {product.color}
        </div>
        <Link to={`/product/${product.productID}`} className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
          {product.productName}
        </Link>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-red-600">{formatVND(product.finalPrice)}</span>
            {product.originalPrice > product.finalPrice && (
              <span className="text-sm text-gray-400 line-through">{formatVND(product.originalPrice)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-gray-50 hover:bg-blue-600 text-gray-900 hover:text-white border border-gray-100 hover:border-transparent rounded-xl py-2.5 flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} /> {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};
