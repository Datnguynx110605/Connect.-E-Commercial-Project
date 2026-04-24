import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { formatVND } from '../data/mock';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useAppContext();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center">
          <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={64} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-8 max-w-md">Chưa có sản phẩm nào trong giỏ hàng của bạn. Cùng khám phá những sản phẩm công nghệ đỉnh cao ngay nhé!</p>
          <button onClick={() => navigate('/products')} className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Tiếp tục mua sắm
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn ({cart.length})</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">Sản phẩm</span>
              <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-medium text-sm">Xóa tất cả</button>
            </div>
            
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productID} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl p-2 flex-shrink-0">
                    <img src={item.imageURL} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <Link to={`/product/${item.productID}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">{item.productName}</Link>
                    <div className="text-xs text-gray-500 mb-2">
                      {item.color} · {item.ram}GB RAM · {item.rom}GB ROM
                    </div>
                    <div className="font-bold text-red-600">{formatVND(item.finalPrice)}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 ml-4">
                    <button onClick={() => removeFromCart(item.productID)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full border border-gray-200 px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.productID, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-full"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productID, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-gray-50 p-6 rounded-3xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tổng quan đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{formatVND(totalAmount)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-red-600">{formatVND(totalAmount)}</span>
                </div>
                <p className="text-right text-xs text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
              </div>
              
              <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                Tiến hành đặt hàng <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
