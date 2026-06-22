import { api } from './api';
import { type Product } from '../mocks/mockData';

export const productService = {
  getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) query.append('page', params.page.toString());
      if (params.limit !== undefined) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.category && params.category !== 'Tất cả') query.append('category', params.category);
    }
    const queryString = query.toString();
    const path = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<any>(path);
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray(response.products)) {
      return response.products;
    }
    return [];
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<any>('/api/products/featured');
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.products)) return response.products;
      return [];
    } catch {
      const all = await api.get<any>('/api/products');
      const list = Array.isArray(all) ? all : all.products || [];
      return list.slice(0, 4);
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/api/products/categories');
      if (Array.isArray(response)) {
        if (!response.includes('Tất cả')) {
          return ['Tất cả', ...response];
        }
        return response;
      }
      return ['Tất cả'];
    } catch {
      try {
        const all = await api.get<any>('/api/products');
        const list: Product[] = Array.isArray(all) ? all : all.products || [];
        const cats = Array.from(new Set(list.map((p) => p.category)));
        return ['Tất cả', ...cats];
      } catch {
        return ['Tất cả', 'Rau Củ', 'Trái Cây', 'Thịt', 'Hải Sản', 'Khác'];
      }
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    return api.get<Product>(`/api/products/${id}`);
  }
};
