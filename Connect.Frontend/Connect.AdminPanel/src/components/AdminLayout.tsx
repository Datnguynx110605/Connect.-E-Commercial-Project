import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Ticket,
  ShoppingCart,
  Star,
  Users,
  CreditCard,
  LogOut,
  Bell,
} from 'lucide-react';
import { tokenStorage } from '../api/client';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', exact: true },
  { icon: Package, label: 'Products', path: '/products', exact: false },
  { icon: Tags, label: 'Categories', path: '/categories', exact: false },
  { icon: Ticket, label: 'Coupons', path: '/coupons', exact: false },
  { icon: ShoppingCart, label: 'Orders', path: '/orders', exact: false },
  { icon: Star, label: 'Reviews', path: '/reviews', exact: false },
  { icon: Users, label: 'Users', path: '/users', exact: false },
  { icon: CreditCard, label: 'Payments', path: '/payments', exact: false },
];

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] text-white flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">AdminUI.</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Control Panel</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}