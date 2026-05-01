import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, CartItem, Product, Order, Category } from '../types';
import {
  authApi,
  productsApi,
  categoriesApi,
  cartApi,
  ordersApi,
  getAccessToken,
  setTokens,
  clearTokens,
  ApiError,
} from '../services/api';

interface AppContextType {
  // Auth
  user: User | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  loadProfile: () => Promise<void>;

  // Products
  products: Product[];
  productsLoading: boolean;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loadProducts: (page?: number, pageSize?: number) => Promise<void>;

  // Categories
  categories: Category[];
  loadCategories: () => Promise<void>;

  // Cart
  cart: CartItem[];
  cartLoading: boolean;
  loadCart: () => Promise<void>;
  addToCart: (productID: number, quantity: number) => Promise<void>;
  increaseCartItem: (cartID: number) => Promise<void>;
  decreaseCartItem: (cartID: number) => Promise<void>;
  removeCartItem: (cartID: number) => Promise<void>;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  loadOrders: (page?: number) => Promise<void>;

  // Product detail cache
  productCache: Map<number, Product>;
  getProduct: (id: number) => Promise<Product>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default to 10, will be updated from backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productCache, setProductCache] = useState<Map<number, Product>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ── Auth ─────────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        setUser(null);
      }
    }
  }, []);

  // On mount: check for existing token and load profile
  useEffect(() => {
    // Handle OAuth callback tokens from URL
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    
    const accessToken = searchParams.get('accessToken') || searchParams.get('access_token') || searchParams.get('token') || 
                        hashParams.get('accessToken') || hashParams.get('access_token') || hashParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token') || 
                         hashParams.get('refreshToken') || hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = getAccessToken();
    if (token) {
      loadProfile().finally(() => setIsAuthLoading(false));
    } else {
      setIsAuthLoading(false);
    }
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setTokens(response.accessToken, response.refreshToken);
    await loadProfile();
  };

  const loginWithGoogle = () => {
    window.location.href = authApi.getOAuthUrl();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setCart([]);
    setOrders([]);
  };

  // ── Products ──────────────────────────────────────────────────────────────

  const loadProducts = useCallback(async (page = 1, pageSize?: number) => {
    setProductsLoading(true);
    try {
      const result = await productsApi.getAll(page, pageSize);
      setProducts(result.items);
      setTotalProducts(result.totalCount);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setPageSize(result.pageSize);
      // Update cache
      setProductCache(prev => {
        const newCache = new Map(prev);
        result.items.forEach(p => newCache.set(p.productID, p));
        return newCache;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const getProduct = useCallback(async (id: number): Promise<Product> => {
    const cached = productCache.get(id);
    if (cached) return cached;

    const product = await productsApi.getDetail(id);
    setProductCache(prev => {
      const newCache = new Map(prev);
      newCache.set(id, product);
      return newCache;
    });
    return product;
  }, [productCache]);

  // ── Categories ────────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      const result = await categoriesApi.getAll(1, 50);
      setCategories(result.items);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ── Cart ──────────────────────────────────────────────────────────────────

  const loadCart = useCallback(async (silent = false) => {
    if (!getAccessToken()) return;
    if (!silent) setCartLoading(true);
    try {
      const result = await cartApi.getMyCart();
      setCart(result.items);
    } catch (err: any) {
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(err.message || 'Failed to load cart');
      }
    } finally {
      if (!silent) setCartLoading(false);
    }
  }, []);

  // Load cart when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user, loadCart]);

  const addToCart = async (productID: number, quantity: number) => {
    try {
      await cartApi.addToCart(productID, quantity);
      await loadCart(true);
    } catch (err: any) {
      throw err;
    }
  };

  const increaseCartItem = async (cartID: number) => {
    try {
      await cartApi.increaseAmount(cartID);
      await loadCart(true);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật số lượng');
      setError(err.message || 'Failed to update cart');
    }
  };

  const decreaseCartItem = async (cartID: number) => {
    try {
      await cartApi.reduceAmount(cartID);
      await loadCart(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update cart');
    }
  };

  const removeCartItem = async (cartID: number) => {
    try {
      await cartApi.deleteCart(cartID);
      await loadCart(true);
    } catch (err: any) {
      setError(err.message || 'Failed to remove from cart');
    }
  };

  // ── Orders ────────────────────────────────────────────────────────────────

  const loadOrders = useCallback(async (page = 1) => {
    if (!getAccessToken()) return;
    setOrdersLoading(true);
    try {
      const result = await ordersApi.getHistory(page, 20);
      setOrders(result.items);
    } catch (err: any) {
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(err.message || 'Failed to load orders');
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      user, isAuthLoading, login, loginWithGoogle, logout, loadProfile,
      products, productsLoading, totalProducts, currentPage, totalPages, pageSize, loadProducts,
      categories, loadCategories,
      cart, cartLoading, loadCart, addToCart, increaseCartItem, decreaseCartItem, removeCartItem,
      orders, ordersLoading, loadOrders,
      productCache, getProduct,
      error, clearError,
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
