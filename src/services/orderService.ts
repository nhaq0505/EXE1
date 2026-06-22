import { api } from './api';

export interface OrderInput {
  receiverName: string;
  phone: string;
  address: string;
  notes?: string;
  items?: { productId: string; quantity: number }[];
}

export interface OrderResponse {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  notes?: string;
  status: string;
  totalAmount: number;
  checkoutUrl?: string;
  createdAt: string;
}

export const orderService = {
  createOrder: async (orderData: OrderInput): Promise<OrderResponse> => {
    return api.post<OrderResponse>('/api/orders', orderData);
  },

  getOrders: async (): Promise<OrderResponse[]> => {
    return api.get<OrderResponse[]>('/api/orders');
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return api.get<OrderResponse>(`/api/orders/${id}`);
  },

  cancelOrder: async (id: string): Promise<OrderResponse> => {
    try {
      return await api.post<OrderResponse>(`/api/orders/${id}/cancel`, {});
    } catch {
      return await api.delete<OrderResponse>(`/api/orders/${id}`);
    }
  }
};
