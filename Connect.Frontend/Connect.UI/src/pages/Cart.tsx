import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Loader2, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { formatVND, formatStorage } from '../data/mock';

export const Cart = () => {
  const { cart, isLoadingUser, removeFromCart, updateQuantity, refreshCart } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  if (isLoadingUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 size={40} className="text-blue-600" />
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative"
          >
            <ShoppingCart size={80} className="text-blue-200" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
            >
              <ShoppingCart size={24} className="text-blue-600" />
            </motion.div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-4"
          >
            Giỏ hàng trống
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mb-10 max-w-md text-center"
          >
            Chưa có sản phẩm nào trong giỏ hàng của bạn. Cùng khám phá những sản phẩm công nghệ đỉnh cao ngay nhé!
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
          >
            Tiếp tục mua sắm
          </motion.button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-4xl font-bold">Giỏ hàng</h1>
          <span className="bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm font-bold">
            {cart.length} sản phẩm
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div
                    key={item.productID}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex gap-6 bg-white p-6 rounded-[32px] border border-gray-100 items-center hover:shadow-xl hover:shadow-gray-500/5 transition-all"
                  >
                    <div className="w-32 h-32 bg-gray-50 rounded-2xl p-4 flex-shrink-0 relative overflow-hidden group-hover:bg-blue-50 transition-colors">
                      <img src={item.imageURL} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/product/${item.productID}`} className="font-bold text-xl text-gray-900 hover:text-blue-600 line-clamp-1 transition-colors">
                          {item.productName}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.cartID)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-medium border border-gray-100">
                          {item.color}
                        </span>
                        {item.ram > 0 && (
                          <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-medium border border-gray-100">
                            {formatStorage(item.ram)} RAM
                          </span>
                        )}
                        {item.rom > 0 && (
                          <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-medium border border-gray-100">
                            {formatStorage(item.rom)} ROM
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="font-black text-2xl text-gray-900">{formatVND(item.finalPrice)}</div>
                        
                        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl border border-gray-200 p-1">
                          <button 
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-6 text-center font-bold text-lg">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Chính sách bảo hành</h4>
                  <p className="text-sm text-blue-700/70">Bảo hành chính hãng 12 tháng tại các trung tâm bảo hành ủy quyền.</p>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex gap-4 items-start">
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 mb-1">Giao hàng miễn phí</h4>
                  <p className="text-sm text-emerald-700/70">Miễn phí giao hàng cho đơn hàng từ 5.000.000đ trở lên trên toàn quốc.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[420px]">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-24">
              <h2 className="text-2xl font-bold mb-8">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span className="font-medium">Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-bold text-gray-900">{formatVND(totalAmount)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6 mb-10">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                  <span className="text-3xl font-black text-red-600 tracking-tight">{formatVND(totalAmount)}</span>
                </div>
                <p className="text-right text-xs text-gray-400">Đã bao gồm thuế giá trị gia tăng VAT</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25"
              >
                Đặt hàng ngay <ArrowRight size={24} />
              </motion.button>          
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
