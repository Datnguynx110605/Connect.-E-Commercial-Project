import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { formatVND } from '../data/mock';
import { useAppContext } from '../context/AppContext';
import { getProductById } from '../api/products';
import { getReviewsByProduct } from '../api/reviews';
import { ProductDto, ReviewDto } from '../api/types';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppContext();

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedRom, setSelectedRom] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getProductById(Number(id)),
      getReviewsByProduct(Number(id)),
    ])
      .then(([prod, revs]) => {
        setProduct(prod);
        setReviews(Array.isArray(revs) ? revs : (revs ? [revs as any] : []));
        setMainImage(prod.imageURL[0] ?? '');
        setSelectedRam(`${prod.ram}GB`);
        setSelectedRom(`${prod.rom}GB`);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h2>
          <button onClick={() => navigate('/products')} className="text-blue-600 hover:underline">
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </Layout>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.productID);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <span>Trang chủ</span> / <span>Sản phẩm</span> /{' '}
          <span className="text-gray-900 font-medium">{product.productName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-3xl aspect-square p-8 flex items-center justify-center border border-gray-100 relative">
              {product.productStatus === 'OutOfStock' && (
                <span className="absolute top-6 left-6 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded text-white z-10 bg-gray-500">
                  Hết hàng
                </span>
              )}
              {product.finalPrice < product.originalPrice && product.productStatus === 'InStock' && (
                <span className="absolute top-6 left-6 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded text-white z-10 bg-red-500">
                  Sale
                </span>
              )}
              <img src={mainImage} alt={product.productName} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            {product.imageURL.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.imageURL.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-xl bg-gray-50 border-2 p-2 flex-shrink-0 transition-colors ${mainImage === img ? 'border-blue-600' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.productName}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />
                ))}
                <span className="text-gray-900 font-medium ml-1">{avgRating}</span>
                <span className="text-gray-400 font-normal">({reviews.length} đánh giá)</span>
              </div>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-gray-500">Kho: {product.stock.toLocaleString()}</span>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-red-600">{formatVND(product.finalPrice)}</span>
                {product.originalPrice > product.finalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">{formatVND(product.originalPrice)}</span>
                )}
              </div>
              {product.originalPrice > product.finalPrice && (
                <p className="text-sm text-green-600 font-medium">
                  Tiết kiệm {formatVND(product.originalPrice - product.finalPrice)}
                </p>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">RAM</h3>
                <div className="flex flex-wrap gap-3">
                  {[`${product.ram}GB`].map((ram) => (
                    <button
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-colors ${selectedRam === ram ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lưu trữ (ROM)</h3>
                <div className="flex flex-wrap gap-3">
                  {[`${product.rom}GB`].map((rom) => (
                    <button
                      key={rom}
                      onClick={() => setSelectedRom(rom)}
                      className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-colors ${selectedRom === rom ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {rom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Màu sắc: <span className="font-normal">{product.color}</span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.productStatus === 'OutOfStock'}
                className="bg-blue-50 text-blue-600 py-4 rounded-full font-bold text-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} /> Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.productStatus === 'OutOfStock'}
                className="bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mua ngay
              </button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
              <div className="text-center">
                <ShieldCheck size={28} className="mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium text-gray-700">100% Chính hãng</p>
              </div>
              <div className="text-center">
                <Truck size={28} className="mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium text-gray-700">Giao hàng tận nơi</p>
              </div>
              <div className="text-center">
                <RotateCcw size={28} className="mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium text-gray-700">Đổi trả 30 ngày</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Đặc điểm nổi bật</h2>
            <div className="prose max-w-none text-gray-600 leading-relaxed bg-gray-50 p-8 rounded-2xl">
              <p>{product.description}</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-gray-900">{avgRating}</div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <div className="text-sm text-gray-500">{reviews.length} bài đánh giá</div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-6 mt-4">
                  {reviews.map((review) => (
                    <div key={review.reviewID} className="border-t border-gray-100 pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            U
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">User #{review.userID}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} size={12} fill={j < review.rating ? 'currentColor' : 'none'} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle2 size={12} /> Đã mua hàng
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">{review.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};
