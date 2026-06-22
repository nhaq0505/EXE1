import { api } from './api';
import { type Farm, type Product } from '../mocks/mockData';

export const farmService = {
  getFarms: async (): Promise<Farm[]> => {
    return api.get<Farm[]>('/api/farms');
  },

  getFeaturedFarms: async (): Promise<Farm[]> => {
    // Try to get from backend featured endpoint, fallback to getFarms and filter or slice
    try {
      return await api.get<Farm[]>('/api/farms/featured');
    } catch {
      const all = await api.get<Farm[]>('/api/farms');
      return all.slice(0, 3); // Fallback to first few
    }
  },

  getFarmById: async (id: string): Promise<Farm> => {
    return api.get<Farm>(`/api/farms/${id}`);
  },

  getProductsByFarmId: async (farmId: string): Promise<Product[]> => {
    try {
      return await api.get<Product[]>(`/api/farms/${farmId}/products`);
    } catch {
      // Fallback in case endpoint is /api/products?farmId=...
      return await api.get<Product[]>(`/api/products?farmId=${farmId}`);
    }
  }
};
