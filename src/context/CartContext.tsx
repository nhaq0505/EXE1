import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../mocks/mockData';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  isSyncing: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'green_solution_local_cart';

const getLocalCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save local cart', error);
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        setIsSyncing(true);
        try {
          const localCart = getLocalCart();
          if (localCart.length > 0) {
            // Đồng bộ từng item lên server
            for (const item of localCart) {
              await cartService.addToCart(item.id, item.quantity);
            }
            // Xoá giỏ hàng cục bộ
            localStorage.removeItem(LOCAL_CART_KEY);
          }
          // Tải giỏ hàng chuẩn từ server
          const serverCart = await cartService.getCart();
          setCart(serverCart);
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Chưa đăng nhập: load từ localStorage
        setCart(getLocalCart());
      }
    };

    syncCart();
  }, [user]);

  const addToCart = async (product: Product) => {
    if (user) {
      try {
        const updatedCart = await cartService.addToCart(product.id, 1);
        setCart(updatedCart);
      } catch (err) {
        console.error('Failed to add to server cart:', err);
      }
    } else {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        let newCart;
        if (existingItem) {
          newCart = prevCart.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newCart = [...prevCart, { ...product, quantity: 1 }];
        }
        saveLocalCart(newCart);
        return newCart;
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        const updatedCart = await cartService.removeFromCart(productId);
        setCart(updatedCart);
      } catch (err) {
        console.error('Failed to remove from server cart:', err);
      }
    } else {
      setCart(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId);
        saveLocalCart(newCart);
        return newCart;
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (user) {
      try {
        const updatedCart = await cartService.updateQuantity(productId, quantity);
        setCart(updatedCart);
      } catch (err) {
        console.error('Failed to update server cart quantity:', err);
      }
    } else {
      setCart(prevCart => {
        const newCart = prevCart.map(item => 
          item.id === productId ? { ...item, quantity } : item
        );
        saveLocalCart(newCart);
        return newCart;
      });
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await cartService.clearCart();
        setCart([]);
      } catch (err) {
        console.error('Failed to clear server cart:', err);
      }
    } else {
      setCart([]);
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ cart, isCartOpen, isSyncing, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
