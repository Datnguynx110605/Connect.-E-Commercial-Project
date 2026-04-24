import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '../api/types';
import { tokenStorage } from '../api/client';
import { getProfile, logout as apiLogout } from '../api/users';
import { getMyCart, addToCart as apiAddToCart, removeCartItem, reduceCartItem } from '../api/carts';
import { getAllProducts } from '../api/products';

// ─── Cart (mirrors backend CartDto joined with Product info) ──────

export type LocalCartItem = {
  cartID: number; // Added to help with API calls
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

  // Cart (API-driven)
  cart: LocalCartItem[];
  refreshCart: () => Promise<void>;
  addToCart: (productID: number, quantity?: number) => Promise<void>;
  removeFromCart: (cartID: number) => Promise<void>;
  updateQuantity: (item: LocalCartItem, newQuantity: number) => Promise<void>;
  clearCart: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [cart, setCart] = useState<LocalCartItem[]>([]);

  const refreshCart = async () => {
    if (!tokenStorage.getAccess()) {
      setCart([]);
      return;
    }
    try {
      const [cartData, productsData] = await Promise.all([
        getMyCart().catch(err => {
          // Handle common error codes that imply an empty/missing cart
          if (err.status === 500 || err.status === 404) return [];
          throw err;
        }),
        getAllProducts()
      ]);

      // Ensure data is always an array (backend might return single object or null)
      const data = Array.isArray(cartData) ? cartData : (cartData ? [cartData] : []);
      const joined: LocalCartItem[] = data.map(bc => {
        const prod = productsData.find(p => p.productID === bc.productID);
        return {
          cartID: bc.cartID,
          productID: bc.productID,
          productName: prod?.productName || `Sản phẩm #${bc.productID}`,
          finalPrice: bc.cartUnitPrice,
          imageURL: prod?.imageURL && prod.imageURL[0] ? prod.imageURL[0] : '',
          color: prod?.color || '',
          ram: prod?.ram || 0,
          rom: prod?.rom || 0,
          quantity: bc.cartQuantity
        };
      });
      setCart(joined);
    } catch (err: any) {
      if (err.status === 404 || err.status === 500) {
        setCart([]);
      } else {
        console.warn('[Cart] Failed to refresh:', err);
      }
    }
  };

  // ── Rehydrate user and cart on first load ───────────
  useEffect(() => {
    const init = async () => {
      const token = tokenStorage.getAccess();
      if (!token) {
        setIsLoadingUser(false);
        return;
      }
      try {
        const profile = await getProfile();
        setUserState(profile);
        await refreshCart();
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoadingUser(false);
      }
    };
    init();
  }, []);

  const setUser = (u: UserDto | null) => {
    setUserState(u);
    if (u) refreshCart();
  };

  const logout = () => {
    apiLogout();
    setUserState(null);
    setCart([]);
  };

  // ── Cart Actions (Direct API calls then refresh) ──────────────

  const addToCart = async (productID: number, quantity = 1) => {
    // Try to get userID from context first, then tokenStorage
    const userId = user?.userID || tokenStorage.getUserId();
    
    if (!userId) {
      console.warn('[Cart] Add to cart failed: No userID found. User may not be logged in.');
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      await apiAddToCart({ userID: userId, productID, quantity });
      await refreshCart();
    } catch (err) {
      console.error('[Cart] Add failed:', err);
      alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const removeFromCart = async (cartID: number) => {
    // Optimistic removal
    setCart(prev => prev.filter(c => c.cartID !== cartID));
    
    try {
      await removeCartItem(cartID);
      await refreshCart();
    } catch (err) {
      console.error('[Cart] Remove failed:', err);
      await refreshCart(); // Re-sync on failure
    }
  };

  const cartRef = React.useRef(cart);
  React.useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const updateQuantity = async (item: LocalCartItem, newQuantity: number) => {
    // Get the most up-to-date quantity from the ref to handle rapid clicks
    const latestItem = cartRef.current.find(c => c.cartID === item.cartID);
    if (!latestItem) return;

    const currentQty = latestItem.quantity;
    const delta = newQuantity - currentQty;
    
    if (delta === 0) return;

    if (newQuantity <= 0) {
      await removeFromCart(item.cartID);
      return;
    }

    // Optimistically update the UI and the ref immediately
    const nextCart = cartRef.current.map(c => c.cartID === item.cartID ? { ...c, quantity: newQuantity } : c);
    cartRef.current = nextCart;
    setCart(nextCart);

    try {
      if (delta < 0) {
        await reduceCartItem(item.cartID, { 
          productID: item.productID, 
          quantity: Math.abs(delta) 
        });
      } else {
        const userId = user?.userID || tokenStorage.getUserId() || 0;
        await apiAddToCart({ 
          userID: userId, 
          productID: item.productID, 
          quantity: delta 
        });
      }
      await refreshCart();
    } catch (err) {
      console.error('[Cart] Update failed:', err);
      await refreshCart(); // Force sync on failure
    }
  };

  const clearCart = () => {
    // API doesn't have clearAll, so we just clear local state for now or delete one by one
    // But per user request "delete all local cart", we focus on API syncing.
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoadingUser,
        setUser,
        logout,
        cart,
        refreshCart,
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
