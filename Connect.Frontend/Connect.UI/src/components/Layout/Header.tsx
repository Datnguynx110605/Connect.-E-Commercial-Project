import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, MapPin } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Header() {
  const { user, cart, categories } = useAppContext();
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-[44px] glass-panel !rounded-none !border-t-0 !border-x-0 !border-b !border-white/40 z-[100] text-ink/80 text-[12px] font-semibold transition-colors">
      <div className="max-w-[1024px] mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-ink hover:text-primary transition-opacity font-bold text-[14px] tracking-widest">
          Connect.
        </Link>
        
        {/* Desktop Nav Items - Dynamic from categories */}
        <nav className="hidden md:flex items-center gap-8">
          {categories.slice(0, 5).map((cat) => (
            <Link 
              key={cat.categoryID} 
              to={`/category/${cat.categoryName}`} 
              className="hover:text-primary transition-colors"
            >
              {cat.categoryName}
            </Link>
          ))}
          {categories.length > 5 && (
            <Link to="/category/All" className="hover:text-primary transition-colors">
              Thêm
            </Link>
          )}
        </nav>
        
        {/* Right Actions */}
        <div className="flex items-center gap-5">
          {/* Address snippet */}
          <div className="hidden md:flex items-center gap-1 opacity-80 cursor-pointer hover:opacity-100 hover:text-primary transition-all">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{user?.address || 'Chọn Địa Chỉ'}</span>
          </div>

          <div className="cursor-pointer hover:opacity-80 hover:text-primary transition-all">
            <Search size={14} className="text-ink" />
          </div>
          
          <Link to="/cart" className="relative hover:opacity-80 hover:text-primary transition-all">
            <ShoppingBag size={14} className="text-ink" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="hidden sm:block text-[12px] font-semibold">{user.userName}</span>
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px]">
                {user.userName.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link to="/login" className="hover:text-primary hover:opacity-80 transition-all flex items-center gap-1">
              <UserIcon size={14} />
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
