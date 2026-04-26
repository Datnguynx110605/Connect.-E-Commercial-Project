import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '../api/types';
import { tokenStorage } from '../api/client';
import { getProfile, logout as apiLogout } from '../api/users';
import { getMyCart, addToCart as apiAddToCart, removeCartItem, increaseCartAmount, reduceCartAmount } from '../api/carts';
import { getAllProducts } from '../api/products';
import { useNotification } from '../components/Notification/NotificationContext';


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


type AppContextType = {
  user: UserDto | null;
  isLoadingUser: boolean;
  setUser: (user: UserDto | null) => void;
  logout: () => void;

  cart: LocalCartItem[];
  refreshCart: () => Promise<void>;
  addToCart: (productID: number) => Promise<void>;
  removeFromCart: (cartID: number) => Promise<void>;
  updateQuantity: (item: LocalCartItem, newQuantity: number) => Promise<void>;
  clearCart: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const { success, error, warning } = useNotification();

  const refreshCart = async () => {
    if (!tokenStorage.getAccess()) {
      setCart([]);
      return;
    }
    try {
      const [cartData, productsData] = await Promise.all([
        getMyCart().catch(err => {
          if (err.status === 500 || err.status === 404) return [];
          throw err;
        }),
        getAllProducts()
      ]);

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


  const addToCart = async (productID: number) => {
    const userId = user?.userID || tokenStorage.getUserId();
    
    if (!userId) {
      warning('Vui lòng đăng nhập để thêm vào giỏ hàng', 'Yêu cầu đăng nhập');
      return;
    }

    try {
      await apiAddToCart(productID);
      await refreshCart();
      success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      console.error('[Cart] Add failed:', err);
      error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const removeFromCart = async (cartID: number) => {
    setCart(prev => prev.filter(c => c.cartID !== cartID));
    
    try {
      await removeCartItem(cartID);
      await refreshCart();
      success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      console.error('[Cart] Remove failed:', err);
      error('Không thể xóa sản phẩm. Vui lòng thử lại.');
      await refreshCart(); 
    }
  };

  const cartRef = React.useRef(cart);
  React.useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const updateQuantity = async (item: LocalCartItem, newQuantity: number) => {
    const latestItem = cartRef.current.find(c => c.cartID === item.cartID);
    if (!latestItem) return;

    const currentQty = latestItem.quantity;
    const delta = newQuantity - currentQty;
    
    if (delta === 0) return;

    if (newQuantity <= 0) {
      await removeFromCart(item.cartID);
      return;
    }

    const nextCart = cartRef.current.map(c => c.cartID === item.cartID ? { ...c, quantity: newQuantity } : c);
    cartRef.current = nextCart;
    setCart(nextCart);

    try {
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          await increaseCartAmount(item.cartID);
        }
      } else {
        for (let i = 0; i < Math.abs(delta); i++) {
          await reduceCartAmount(item.cartID);
        }
      }
      await refreshCart();
    } catch (err) {
      console.error('[Cart] Update failed:', err);
      error('Không thể cập nhật số lượng. Vui lòng thử lại.');
      await refreshCart(); // Force sync on failure
    }
  };

  const clearCart = () => {
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
