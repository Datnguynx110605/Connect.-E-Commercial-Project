import { Search, MapPin, ShoppingCart, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Header = () => {
  const { cart, user, logout } = useAppContext();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link to="/home" className="text-3xl font-bold tracking-tighter text-blue-600">Connect.</Link>
        
        <div className="flex-1 max-w-2xl flex items-center">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Bạn muốn tìm gì hôm nay?" 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 rounded-full">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            <MapPin size={20} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Giao đến</p>
              <p className="font-medium truncate max-w-[120px]">{user?.address || 'Chọn địa chỉ'}</p>
            </div>
          </div>

          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] flex items-center justify-center rounded-full px-1 border-2 border-white">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pl-3 rounded-full border border-gray-100 transition-all">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.userName}</span>
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.userName?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all">
              <User size={18} />
              <span className="hidden sm:block">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
