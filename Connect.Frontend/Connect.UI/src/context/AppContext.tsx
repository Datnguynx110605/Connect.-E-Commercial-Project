import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '../api/types';
import { tokenStorage } from '../api/client';
import { getProfile, logout as apiLogout } from '../api/users';
import { addToCart as apiAddToCart } from '../api/carts';

// ─── Cart (local state — mirrors backend CartDto shape) ───────

export type LocalCartItem = {
  productID: number;
  productName: string;
  finalPrice: number;
  imageURL: string;
  color: string;
  ram: number;
  rom: number;
  quantity: number;
};

// ─── Context shape ────────────────────────────────────────────

type AppContextType = {
  // Auth
  user: UserDto | null;
  isLoadingUser: boolean;
  setUser: (user: UserDto | null) => void;
  logout: () => void;

  // Local cart (used before checkout; actual cart API called per page)
  cart: LocalCartItem[];
  addToCart: (item: Omit<LocalCartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productID: number) => void;
  updateQuantity: (productID: number, quantity: number) => void;
  clearCart: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [cart, setCart] = useState<LocalCartItem[]>([]);

  // ── Rehydrate user from stored token on first load ───────────
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setIsLoadingUser(false);
      return;
    }
    getProfile()
      .then((profile) => setUserState(profile))
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoadingUser(false));
  }, []);

  const setUser = (u: UserDto | null) => setUserState(u);

  const logout = () => {
    apiLogout();
    setUserState(null);
    setCart([]);
  };

  // ── Cart helpers ─────────────────────────────────────────────

  const addToCart = (item: Omit<LocalCartItem, 'quantity'>, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productID === item.productID);
      if (existing) {
        return prev.map((c) =>
          c.productID === item.productID
            ? { ...c, quantity: Math.min(c.quantity + quantity, 10) }
            : c
        );
      }
      return [...prev, { ...item, quantity }];
    });
    // Silently sync to backend cart if user is authenticated
    if (tokenStorage.getAccess()) {
      const userId = tokenStorage.getUserId();
      if (userId) {
        apiAddToCart({ userID: userId, productID: item.productID, quantity })
          .catch((err) => console.warn('[Cart sync] Failed to sync to backend:', err));
      }
    }
  };

  const removeFromCart = (productID: number) => {
    setCart((prev) => prev.filter((c) => c.productID !== productID));
  };

  const updateQuantity = (productID: number, quantity: number) => {
    if (quantity <= 0) return;
    setCart((prev) =>
      prev.map((c) => (c.productID === productID ? { ...c, quantity: Math.min(quantity, 10) } : c))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider
      value={{
        user,
        isLoadingUser,
        setUser,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
