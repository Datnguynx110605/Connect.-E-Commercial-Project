import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Star, Trash2, Edit2, ShoppingBag, Loader2 } from 'lucide-react';
import { Product, Review } from '../types';
import { productsApi, reviewsApi, ApiError } from '../services/api';
import { formatROM } from '../utils/formatUtils';


export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, user } = useAppContext();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [addingToCart, setAddingToCart] = useState(false);

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productsApi.getDetail(Number(id));
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const result = await reviewsApi.getByProduct(Number(id), 1, 50);
        setReviews(result.items);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-apple-body">Không tìm thấy sản phẩm</div>;
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.productID, 1);
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.productID, 1);
      navigate('/checkout');
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }
    
    setReviewSubmitting(true);
    setReviewError('');
    
    try {
      if (editingReviewId) {
        const updated = await reviewsApi.update(editingReviewId, { rating, body: feedbackText });
        setReviews(reviews.map(r => r.reviewID === editingReviewId ? updated : r));
        setEditingReviewId(null);
      } else {
        const created = await reviewsApi.create({ productID: product.productID, rating, body: feedbackText });
        setReviews([created, ...reviews]);
      }
      setFeedbackText('');
      setRating(5);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 409) setReviewError('Bạn đã đánh giá sản phẩm này rồi.');
        else setReviewError(err.message);
      } else {
        setReviewError('Gửi đánh giá thất bại.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      await reviewsApi.delete(reviewId);
      setReviews(reviews.filter(r => r.reviewID !== reviewId));
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : 'Xóa đánh giá thất bại.');
    }
  };

  const editReview = (r: Review) => {
    setEditingReviewId(r.reviewID);
    setFeedbackText(r.body);
    setRating(r.rating);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : null;

  return (
    <div className="min-h-screen relative z-10">
      {/* Product Top Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Image Gallery */}
        <div className="flex-1 w-full md:w-1/2">
          <div className="aspect-[4/5] glass-panel overflow-hidden group mb-4">
            <img 
              src={product.imageURL?.[activeImage] || 'https://via.placeholder.com/600?text=No+Image'} 
              alt={product.productName} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
            />
          </div>
          {product.imageURL && product.imageURL.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 p-2">
              {product.imageURL.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 bg-white/50 backdrop-blur shadow-sm rounded-[12px] overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-1 ring-primary' : 'border-white/50 hover:border-primary/50'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col">
          <h1 className="text-apple-display-lg mb-2 text-ink">{product.productName}</h1>
          
          <div className="flex items-center gap-4 mb-2 text-[14px] text-ink/70 font-medium">
            <span>{product.color}</span>
            <span>RAM: {product.ram}GB</span>
            <span>ROM: {formatROM(product.rom)}</span>

          </div>
          
          <div className="flex items-center gap-4 mb-6 text-[14px] text-ink/70 font-medium">
            <span className={product.stock > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {product.productStatus === 'InStock' ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
            {averageRating && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-[#f59e0b]" fill="#f59e0b" />
                {averageRating} ({reviews.length} đánh giá)
              </span>
            )}
          </div>

          <div className="mb-8 p-6 glass-panel flex flex-col justify-center">
            <div className="flex items-baseline gap-3">
              <span className="text-apple-display-md text-ink">{product.finalPrice.toLocaleString('vi-VN')} ₫</span>
              {product.finalPrice < product.originalPrice && (
                <span className="text-apple-body text-ink-muted line-through">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
              )}
            </div>
            {product.finalPrice < product.originalPrice && (
              <div className="text-[14px] text-[#008a00] font-semibold mt-1">
                Tiết kiệm {(product.originalPrice - product.finalPrice).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-ink/10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 glass-btn py-4 rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              Thêm vào giỏ
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 btn-primary py-4 font-semibold disabled:opacity-50"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 mb-8 mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-[1200px] mx-auto glass-panel p-8 md:p-16">
          <h2 className="text-apple-display-md mb-6">Thông tin Sản phẩm</h2>
          <p className="text-apple-lead text-ink-muted max-w-[800px] leading-relaxed">
            {product.description}
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[14px]">
            <div className="glass-btn p-4 rounded-[16px] text-center">
              <div className="text-ink-muted text-[12px] mb-1">RAM</div>
              <div className="font-semibold">{product.ram}GB</div>
            </div>
            <div className="glass-btn p-4 rounded-[16px] text-center">
              <div className="text-ink-muted text-[12px] mb-1">Bộ nhớ</div>
              <div className="font-semibold">{formatROM(product.rom)}</div>

            </div>
            <div className="glass-btn p-4 rounded-[16px] text-center">
              <div className="text-ink-muted text-[12px] mb-1">Màu sắc</div>
              <div className="font-semibold">{product.color}</div>
            </div>
            <div className="glass-btn p-4 rounded-[16px] text-center">
              <div className="text-ink-muted text-[12px] mb-1">Trạng thái</div>
              <div className="font-semibold">{product.productStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mx-4 sm:mx-6 lg:mx-8 pb-16">
        <div className="max-w-[1200px] mx-auto glass-panel p-8 md:p-16">
          <h2 className="text-apple-display-md mb-10">Đánh giá & Nhận xét</h2>

          {/* Review Form */}
          <div className="mb-12 bg-white/50 backdrop-blur shadow-sm border border-white/50 p-8 rounded-[24px]">
            <h3 className="text-apple-body-strong mb-4">{editingReviewId ? 'Chỉnh sửa nhận xét' : 'Viết đánh giá'}</h3>
            {reviewError && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] rounded-[8px] px-3 py-2 text-[13px] mb-4">
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview}>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    type="button" 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`focus:outline-none ${star <= rating ? 'text-[#f59e0b]' : 'text-[#d2d2d7]'}`}
                  >
                    <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea 
                required
                rows={4}
                minLength={5}
                maxLength={2000}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Bạn nghĩ sao về sản phẩm này? (5-2000 ký tự)"
                className="w-full px-4 py-3 rounded-[12px] bg-white/60 backdrop-blur shadow-sm border border-white/50 focus:outline-none focus:border-primary focus:bg-white/90 transition-all text-[17px] mb-4"
              />
              <button type="submit" disabled={reviewSubmitting} className="btn-primary disabled:opacity-50">
                {reviewSubmitting ? 'Đang gửi...' : (editingReviewId ? 'Cập nhật' : 'Gửi Nhận xét')}
              </button>
              {editingReviewId && (
                <button type="button" onClick={() => {setEditingReviewId(null); setFeedbackText(''); setRating(5);}} className="ml-4 text-[14px] text-ink-muted hover:text-ink">
                  Hủy
                </button>
              )}
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-8">
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-ink-muted">Chưa có đánh giá. Hãy là người đầu tiên nhận xét!</p>
            ) : (
              reviews.map(r => (
                <div key={r.reviewID} className="border-b border-ink/10 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-tile-1 flex items-center justify-center text-white font-semibold">
                        U{r.userID}
                      </div>
                      <div>
                        <div className="text-apple-body-strong">Người dùng #{r.userID}</div>
                        <div className="flex text-[#f59e0b] mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} className={i < r.rating ? 'text-[#f59e0b]' : 'text-divider-soft'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Note: we can only detect own reviews if we decode the JWT for userID. For now show edit/delete buttons. The API will enforce ownership. */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => editReview(r)} className="text-ink-muted hover:text-primary"><Edit2 size={16} /></button>
                      <button onClick={() => deleteReview(r.reviewID)} className="text-ink-muted hover:text-[#ef4444]"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-apple-body mt-4 text-ink">{r.body}</p>
                  <div className="text-[12px] text-ink-muted mt-2">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
