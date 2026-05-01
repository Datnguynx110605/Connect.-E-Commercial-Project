/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Coupons } from './pages/Coupons';
import { Reviews } from './pages/Reviews';
import { Carts } from './pages/Carts';
import { Orders } from './pages/Orders';
import { Payments } from './pages/Payments';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';

import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'categories': return <Categories />;
      case 'coupons': return <Coupons />;
      case 'reviews': return <Reviews />;
      case 'carts': return <Carts />;
      case 'orders': return <Orders />;
      case 'payments': return <Payments />;
      case 'users': return <Users />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {renderPage()}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

