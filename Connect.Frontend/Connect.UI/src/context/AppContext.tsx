import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, Order, Coupon } from '../types';


interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectFields?: {color?: string, ram?: string, rom?: string}) => void;
  updateCartQuantity: (id: string, selectFields: any, delta: number) => void;
  clearCart: () => void;
  
  products: Product[];
  coupons: Coupon[];
  
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const login = (newUser: User) => setUser(newUser);
  const logout = () => setUser(null);
  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.productId === item.productId &&
               c.selectedColor === item.selectedColor &&
               c.selectedRam === item.selectedRam &&
               c.selectedRom === item.selectedRom
      );
      if (existing) {
        return prev.map((c) => c === existing ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string, selectFields?: any) => {
    setCart((prev) => prev.filter((c) => !(c.productId === id && c.selectedColor === selectFields?.color && c.selectedRom === selectFields?.rom && c.selectedRam === selectFields?.ram)));
  };

  const updateCartQuantity = (id: string, selectFields: any, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.productId === id && c.selectedColor === selectFields?.color && c.selectedRom === selectFields?.rom && c.selectedRam === selectFields?.ram) {
        const newQ = c.quantity + delta;
        return newQ > 0 ? { ...c, quantity: newQ } : c;
      }
      return c;
    }));
  };

  const clearCart = () => setCart([]);
  
  const addOrder = (order: Order) => setOrders((prev) => [order, ...prev]);
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      products, coupons,
      orders, addOrder, updateOrderStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
