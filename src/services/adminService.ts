import { api } from './api';
import { type Product } from '../mocks/mockData';

export interface DashboardResponse {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  bestSellers: {
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
}

export interface AdminFarm {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  rating: number;
  videoUrl?: string;
  ownerId?: string;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  farmId: string;
  name: string;
  image: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  farmName?: string;
  isActive: boolean;
}

export interface AdminMealPlan {
  id: string;
  title: string;
  targetAudience: string;
  calories: number;
  dishes: string[];
  features: string[];
  totalPrice: number;
  isActive: boolean;
  ingredients: Product[];
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  orderCode?: string;
  receiverName: string;
  phone: string;
  address: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  checkoutUrl?: string;
  createdAt: string;
  items: AdminOrderItem[];
}

export const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardResponse> => {
    return api.get<DashboardResponse>('/api/admin/dashboard');
  },

  // Farms
  getFarms: async (): Promise<AdminFarm[]> => {
    return api.get<AdminFarm[]>('/api/admin/farms');
  },
  createFarm: async (farm: Omit<AdminFarm, 'id' | 'isActive'>): Promise<AdminFarm> => {
    return api.post<AdminFarm>('/api/admin/farms', farm);
  },
  updateFarm: async (id: string, farm: Omit<AdminFarm, 'id'>): Promise<AdminFarm> => {
    return api.put<AdminFarm>(`/api/admin/farms/${id}`, farm);
  },
  deleteFarm: async (id: string): Promise<any> => {
    return api.delete(`/api/admin/farms/${id}`);
  },

  // Products
  getProducts: async (): Promise<AdminProduct[]> => {
    return api.get<AdminProduct[]>('/api/admin/products');
  },
  createProduct: async (product: Omit<AdminProduct, 'id' | 'farmName' | 'isActive'>): Promise<AdminProduct> => {
    return api.post<AdminProduct>('/api/admin/products', product);
  },
  updateProduct: async (id: string, product: Omit<AdminProduct, 'id' | 'farmName'>): Promise<AdminProduct> => {
    return api.put<AdminProduct>(`/api/admin/products/${id}`, product);
  },
  deleteProduct: async (id: string): Promise<any> => {
    return api.delete(`/api/admin/products/${id}`);
  },
  updateProductStock: async (id: string, stock: number): Promise<any> => {
    return api.patch(`/api/admin/products/${id}/stock`, { stock });
  },

  // Meal Plans
  getMealPlans: async (): Promise<AdminMealPlan[]> => {
    return api.get<AdminMealPlan[]>('/api/admin/meal-plans');
  },
  createMealPlan: async (mealPlan: Omit<AdminMealPlan, 'id' | 'isActive' | 'ingredients' | 'totalPrice'> & { ingredientProductIds: string[] }): Promise<AdminMealPlan> => {
    return api.post<AdminMealPlan>('/api/admin/meal-plans', mealPlan);
  },
  updateMealPlan: async (id: string, mealPlan: Omit<AdminMealPlan, 'id' | 'ingredients' | 'totalPrice'> & { ingredientProductIds: string[] }): Promise<AdminMealPlan> => {
    return api.put<AdminMealPlan>(`/api/admin/meal-plans/${id}`, mealPlan);
  },
  deleteMealPlan: async (id: string): Promise<any> => {
    return api.delete(`/api/admin/meal-plans/${id}`);
  },

  // Orders
  getOrders: async (): Promise<AdminOrder[]> => {
    return api.get<AdminOrder[]>('/api/admin/orders');
  },
  getOrderById: async (id: string): Promise<AdminOrder> => {
    return api.get<AdminOrder>(`/api/admin/orders/${id}`);
  },
  updateOrderStatus: async (id: string, status: string): Promise<AdminOrder> => {
    return api.patch<AdminOrder>(`/api/admin/orders/${id}/status`, { status });
  }
};
