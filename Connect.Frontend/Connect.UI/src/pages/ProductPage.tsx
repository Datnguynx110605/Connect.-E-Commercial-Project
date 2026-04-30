import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Star, Trash2, Edit2, ShoppingBag } from 'lucide-react';
import { Feedback } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, user } = useAppContext();
  
  const product = products.find(p => p.id === id);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedRom, setSelectedRom] = useState<string>('');
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      if (product.colorOptions?.length) setSelectedColor(product.colorOptions[0]);
      if (product.ramOptions?.length) setSelectedRam(product.ramOptions[0]);
      if (product.romOptions?.length) setSelectedRom(product.romOptions[0]);
      setFeedbacks(product.feedbacks || []);
    }
  }, [product]);

  if (!product) {
    return <div className="text-center py-20 text-apple-body">Product not found</div>;
  }

  const handleAddToCart = () => {
    addToCart({
      id: Math.random().toString(),
      productId: product.id,
      name: product.name,
      image: product.images[0],
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      quantity: 1,
      selectedColor,
      selectedRam,
      selectedRom
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to leave feedback");
      return;
    }
    
    if (editingFeedbackId) {
      setFeedbacks(feedbacks.map(f => f.id === editingFeedbackId ? { ...f, comment: feedbackText, rating } : f));
      setEditingFeedbackId(null);
    } else {
      const newFeedback: Feedback = {
        id: Math.random().toString(),
        userId: user.id,
        username: user.username,
        avatar: user.avatar || '',
        rating,
        comment: feedbackText,
        createdAt: new Date().toISOString(),
      };
      setFeedbacks([newFeedback, ...feedbacks]);
    }
    setFeedbackText('');
    setRating(5);
  };

  const deleteFeedback = (fId: string) => {
    setFeedbacks(feedbacks.filter(f => f.id !== fId));
  };

  const editFeedback = (f: Feedback) => {
    setEditingFeedbackId(f.id);
    setFeedbackText(f.comment);
    setRating(f.rating);
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Product Top Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Mega Image Gallery */}
        <div className="flex-1 w-full md:w-1/2">
          {/* Main Image - zoom effect on hover */}
          <div className="aspect-[4/3] glass-panel overflow-hidden flex items-center justify-center p-8 group mb-4">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-700 cursor-zoom-in drop-shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
            />
          </div>
          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 p-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 bg-white/50 backdrop-blur shadow-sm rounded-[12px] p-2 border-2 transition-all ${activeImage === idx ? 'border-primary ring-1 ring-primary' : 'border-white/50 hover:border-primary/50'}`}
                >
                  <img src={img} className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col">
          {product.isAppleVerified && (
            <div className="flex items-center gap-1 text-[14px] font-semibold text-[#c96211] mb-2">
              <CheckCircle2 size={16} /> Connect Xác minh
            </div>
          )}
          <h1 className="text-apple-display-lg mb-2 text-ink">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6 text-[14px] text-ink/70 font-medium">
            <span>Đã bán: {product.soldAmount.toLocaleString('vi-VN')}</span>
            <span>Kho: {product.stock > 0 ? product.stock : 'Hết hàng'}</span>
          </div>

          <div className="mb-8 p-6 glass-panel flex flex-col justify-center">
            <div className="flex items-baseline gap-3">
              <span className="text-apple-display-md text-ink">{product.salePrice.toLocaleString('vi-VN')} ₫</span>
              {product.salePrice < product.originalPrice && (
                <span className="text-apple-body text-ink-muted line-through">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
              )}
            </div>
            {product.salePrice < product.originalPrice && (
              <div className="text-[14px] text-[#008a00] font-semibold mt-1">
                Tiết kiệm {(product.originalPrice - product.salePrice).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          <div className="space-y-6 flex-1">
            {/* Color Selection */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div>
                <h3 className="text-apple-body-strong mb-3">Màu sắc - <span className="text-ink-muted">{selectedColor}</span></h3>
                <div className="flex flex-wrap gap-3">
                  {product.colorOptions.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-3 rounded-full text-[14px] min-w-[80px] ${selectedColor === color ? 'glass-btn-active' : 'glass-btn'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ROM Selection */}
            {product.romOptions && product.romOptions.length > 0 && (
              <div>
                <h3 className="text-apple-body-strong mb-3">Dung lượng</h3>
                <div className="flex flex-wrap gap-3">
                  {product.romOptions.map(rom => (
                    <button 
                      key={rom}
                      onClick={() => setSelectedRom(rom)}
                      className={`px-5 py-3 rounded-[16px] text-[14px] min-w-[80px] ${selectedRom === rom ? 'glass-btn-active' : 'glass-btn'}`}
                    >
                      {rom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RAM Selection */}
            {product.ramOptions && product.ramOptions.length > 0 && (
              <div>
                <h3 className="text-apple-body-strong mb-3">Bộ nhớ (RAM)</h3>
                <div className="flex flex-wrap gap-3">
                  {product.ramOptions.map(ram => (
                    <button 
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-5 py-3 rounded-[16px] text-[14px] min-w-[80px] ${selectedRam === ram ? 'glass-btn-active' : 'glass-btn'}`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-ink/10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 glass-btn py-4 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} /> Thêm vào giỏ
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 btn-primary py-4 font-semibold"
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
        </div>
      </div>

      {/* Feedbacks */}
      <div className="mx-4 sm:mx-6 lg:mx-8 pb-16">
        <div className="max-w-[1200px] mx-auto glass-panel p-8 md:p-16">
          <h2 className="text-apple-display-md mb-10">Đánh giá & Nhận xét</h2>

          {/* Feedback Form */}
          <div className="mb-12 bg-white/50 backdrop-blur shadow-sm border border-white/50 p-8 rounded-[24px]">
            <h3 className="text-apple-body-strong mb-4">{editingFeedbackId ? 'Chỉnh sửa nhận xét' : 'Viết đánh giá'}</h3>
            <form onSubmit={handleSubmitFeedback}>
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
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Bạn nghĩ sao về sản phẩm này?"
                className="w-full px-4 py-3 rounded-[12px] bg-white/60 backdrop-blur shadow-sm border border-white/50 focus:outline-none focus:border-primary focus:bg-white/90 transition-all text-[17px] mb-4"
              />
              <button type="submit" className="btn-primary">
                {editingFeedbackId ? 'Cập nhật' : 'Gửi Nhận xét'}
              </button>
              {editingFeedbackId && (
                <button type="button" onClick={() => {setEditingFeedbackId(null); setFeedbackText(''); setRating(5);}} className="ml-4 text-[14px] text-ink-muted hover:text-ink">
                  Hủy
                </button>
              )}
            </form>
          </div>

          {/* Feedback List */}
          <div className="space-y-8">
            {feedbacks.length === 0 ? (
              <p className="text-ink-muted">Chưa có đánh giá. Hãy là người đầu tiên nhận xét!</p>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} className="border-b border-ink/10 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {f.avatar ? (
                        <img src={f.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-tile-1 flex items-center justify-center text-white font-semibold">
                          {f.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-apple-body-strong">{f.username}</div>
                        <div className="flex text-[#f59e0b] mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < f.rating ? 'currentColor' : 'none'} className={i < f.rating ? 'text-[#f59e0b]' : 'text-divider-soft'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {user?.id === f.userId && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => editFeedback(f)} className="text-ink-muted hover:text-primary"><Edit2 size={16} /></button>
                        <button onClick={() => deleteFeedback(f.id)} className="text-ink-muted hover:text-[#ef4444]"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-apple-body mt-4 text-ink">{f.comment}</p>
                  <div className="text-[12px] text-ink-muted mt-2">{new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
