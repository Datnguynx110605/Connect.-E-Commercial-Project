import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Ticket, 
  Star, 
  ShoppingCart, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  Bell 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'categories', label: 'Danh mục', icon: Layers },
  { id: 'coupons', label: 'Mã giảm giá', icon: Ticket },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'carts', label: 'Giỏ hàng', icon: ShoppingCart },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  { id: 'payments', label: 'Thanh toán', icon: CreditCard },
  { id: 'users', label: 'Tài khoản', icon: Users },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-500 shrink-0" />
          <span className="truncate" title="Connect. Administrator Management">Connect. Management</span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium relative group",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
