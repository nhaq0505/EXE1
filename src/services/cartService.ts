import { api } from './api';
import { type CartItem } from '../context/CartContext';

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get<any>('/api/cart');
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.items)) return response.items;
      return [];
    } catch {
      return [];
    }
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem[]> => {
    const response = await api.post<any>('/api/cart/items', { productId, quantity });
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.items)) return response.items;
    return [];
  },

  updateQuantity: async (productId: string, quantity: number): Promise<CartItem[]> => {
    const response = await api.patch<any>(`/api/cart/items/${productId}`, { quantity });
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.items)) return response.items;
    return [];
  },

  removeFromCart: async (productId: string): Promise<CartItem[]> => {
    const response = await api.delete<any>(`/api/cart/items/${productId}`);
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.items)) return response.items;
    return [];
  },

  clearCart: async (): Promise<void> => {
    try {
      await api.delete<void>('/api/cart');
    } catch {
      // Ignore
    }
  },

  addMealPlanIngredients: async (mealPlanId: string, productIds: string[]): Promise<CartItem[]> => {
    try {
      const response = await api.post<any>(`/api/cart/mealplans/${mealPlanId}`, { productIds });
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.items)) return response.items;
      return [];
    } catch {
      // Fallback: add items individually
      let lastCart: CartItem[] = [];
      for (const pid of productIds) {
        lastCart = await cartService.addToCart(pid, 1);
      }
      return lastCart;
    }
  }
};
