import { api } from './api';
import { type Product } from '../mocks/mockData';

export interface FarmStatistics {
  revenue: number;
  activeProductsCount: number;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export interface FarmOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
}

export interface FarmOrder {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  notes?: string;
  status: string; // "Pending", "Processing", "Delivered", "Cancelled"
  totalAmount: number;
  createdAt: string;
  items: FarmOrderItem[];
}

export interface FarmSettings {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  videoUrl?: string; // 24/24 monitoring camera URL
}

// Initial mock state keys for local storage
const PRODUCTS_KEY = 'green_solution_farm_products';
const ORDERS_KEY = 'green_solution_farm_orders';
const SETTINGS_KEY = 'green_solution_farm_settings';

// Helper to initialize mock data if not present in localStorage
const initializeMockData = () => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    // We default the logged-in farm owner to "f1" (Rau Xanh Đà Nẵng)
    // and grab its initial products
    import('../mocks/mockData').then(({ products }) => {
      const farm1Products = products.filter(p => p.farmId === 'f1');
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(farm1Products));
    });
  }

  if (!localStorage.getItem(SETTINGS_KEY)) {
    import('../mocks/mockData').then(({ farms }) => {
      const farm1 = farms.find(f => f.id === 'f1') || farms[0];
      const settings: FarmSettings = {
        id: farm1.id,
        name: farm1.name,
        image: farm1.image,
        description: farm1.description,
        location: farm1.location,
        videoUrl: farm1.videoUrl || "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4"
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    });
  }

  if (!localStorage.getItem(ORDERS_KEY)) {
    // Generate some initial orders for this farm
    const initialOrders: FarmOrder[] = [
      {
        id: 'ord-1001',
        receiverName: 'Nguyễn Văn Hùng',
        phone: '0905123456',
        address: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
        notes: 'Giao giờ hành chính',
        status: 'Pending',
        totalAmount: 115000,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        items: [
          { productId: 'p1', productName: 'Cà Chua Hữu Cơ', price: 35000, quantity: 2, unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop' },
          { productId: 'p2', productName: 'Xà Lách Tươi', price: 20000, quantity: 2, unit: 'bó', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=2069&auto=format&fit=crop' },
          { productId: 'p27', productName: 'Rau Ngò Tươi', price: 8000, quantity: 1, unit: 'bó', image: 'https://images.unsplash.com/photo-1592928302636-c83cf1e1c887?q=80&w=2000&auto=format&fit=crop' }
        ]
      },
      {
        id: 'ord-1002',
        receiverName: 'Trần Thị Mai',
        phone: '0914987654',
        address: '45 Lê Lợi, Thạch Thang, Hải Châu, Đà Nẵng',
        status: 'Processing',
        totalAmount: 90000,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        items: [
          { productId: 'p11', productName: 'Cà Rốt Hữu Cơ', price: 25000, quantity: 3, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2000&auto=format&fit=crop' },
          { productId: 'p17', productName: 'Đậu Phụ Non', price: 15000, quantity: 1, unit: 'bịch', image: 'https://i.pinimg.com/736x/19/dd/07/19dd078faef91d90cad85ffcf6aba6bb.jpg' }
        ]
      },
      {
        id: 'ord-1003',
        receiverName: 'Lê Hoàng Nam',
        phone: '0983222333',
        address: 'K23/12 Trần Kế Xương, Đà Nẵng',
        notes: 'Gọi trước khi giao 15 phút',
        status: 'Delivered',
        totalAmount: 105000,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
        items: [
          { productId: 'p1', productName: 'Cà Chua Hữu Cơ', price: 35000, quantity: 3, unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop' }
        ]
      }
    ];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(initialOrders));
  }
};

// Execute initializers
initializeMockData();

// Local helpers for fallback
const getLocalProducts = (): Product[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

const getLocalOrders = (): FarmOrder[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalOrders = (orders: FarmOrder[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

const getLocalSettings = (): FarmSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : {
    id: 'f1',
    name: 'Rau Xanh Đà Nẵng',
    image: 'https://rauxanhdanang.com/wp-content/uploads/2023/04/rauxanhdanang.com-logo-1.png',
    description: 'Trang trại hữu cơ xanh mút, cam kết canh tác bền vững và an toàn cho sức khỏe.',
    location: 'Hoà Vang, Đà Nẵng',
    videoUrl: 'https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4'
  };
};

const saveLocalSettings = (settings: FarmSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const farmOwnerService = {
  // 1. Get farm statistics
  getStatistics: async (): Promise<FarmStatistics> => {
    try {
      const res = await api.get<any>('/api/farm-owner/dashboard');
      return {
        revenue: res.totalRevenue ?? res.TotalRevenue ?? 0,
        activeProductsCount: res.totalProducts ?? res.TotalProducts ?? 0,
        pendingOrdersCount: res.pendingOrdersCount ?? res.PendingOrdersCount ?? 0,
        lowStockCount: (res.lowStockProducts ?? res.LowStockProducts ?? []).length
      };
    } catch {
      // Fallback
      const products = getLocalProducts();
      const orders = getLocalOrders();
      
      const activeProductsCount = products.length;
      const lowStockCount = products.filter(p => p.stock <= 5).length;
      const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
      
      // Calculate revenue from Delivered orders
      const revenue = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        revenue,
        activeProductsCount,
        pendingOrdersCount,
        lowStockCount
      };
    }
  },

  // 2. Products CRUD and Quick Stock Update
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await api.get<any>('/api/farm-owner/products');
      return Array.isArray(res) ? res : (res.items || res.Items || []);
    } catch {
      return getLocalProducts();
    }
  },

  updateStock: async (id: string, newStock: number): Promise<Product> => {
    try {
      return await api.patch<Product>(`/api/farm-owner/products/${id}/stock`, { stock: newStock });
    } catch {
      // Fallback
      const products = getLocalProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      
      products[index].stock = newStock;
      saveLocalProducts(products);
      return products[index];
    }
  },

  createProduct: async (productData: Omit<Product, 'id' | 'farmId'>): Promise<Product> => {
    try {
      return await api.post<Product>('/api/farm-owner/products', productData);
    } catch {
      const products = getLocalProducts();
      const settings = getLocalSettings();
      const newProduct: Product = {
        ...productData,
        id: `p-${Date.now()}`,
        farmId: settings.id || 'f1'
      };
      products.unshift(newProduct);
      saveLocalProducts(products);
      return newProduct;
    }
  },

  updateProduct: async (id: string, productData: Partial<Omit<Product, 'id' | 'farmId'>>): Promise<Product> => {
    try {
      return await api.put<Product>(`/api/farm-owner/products/${id}`, productData);
    } catch {
      const products = getLocalProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      
      products[index] = {
        ...products[index],
        ...productData
      };
      saveLocalProducts(products);
      return products[index];
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/farm-owner/products/${id}`);
    } catch {
      const products = getLocalProducts();
      const filtered = products.filter(p => p.id !== id);
      saveLocalProducts(filtered);
    }
  },

  // 3. Orders List & Management
  getOrders: async (): Promise<FarmOrder[]> => {
    try {
      const res = await api.get<any>('/api/farm-owner/orders');
      return Array.isArray(res) ? res : (res.items || res.Items || []);
    } catch {
      return getLocalOrders();
    }
  },

  updateOrderStatus: async (id: string, status: string): Promise<FarmOrder> => {
    try {
      return await api.patch<FarmOrder>(`/api/farm-owner/orders/${id}/status`, { status });
    } catch {
      const orders = getLocalOrders();
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');
      
      orders[index].status = status;
      saveLocalOrders(orders);
      return orders[index];
    }
  },

  // 4. Farm Settings
  getFarmSettings: async (): Promise<FarmSettings> => {
    try {
      return await api.get<FarmSettings>('/api/farm-owner/profile');
    } catch {
      return getLocalSettings();
    }
  },

  updateFarmSettings: async (settingsData: Omit<FarmSettings, 'id'>): Promise<FarmSettings> => {
    try {
      return await api.put<FarmSettings>('/api/farm-owner/profile', settingsData);
    } catch {
      const current = getLocalSettings();
      const updated: FarmSettings = {
        ...current,
        ...settingsData
      };
      saveLocalSettings(updated);
      
      // Also update settings in local green_solution_farm_settings
      return updated;
    }
  }
};
