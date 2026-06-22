import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Page imports
import Home from './pages/Home';
import Shop from './pages/Shop';
import FarmDetail from './pages/FarmDetail';
import Checkout from './pages/Checkout';
import MealPlans from './pages/MealPlans';

// FarmOwner page imports
import FarmOwnerDashboard from './pages/FarmOwner/Dashboard';
import FarmOwnerInventory from './pages/FarmOwner/Inventory';
import FarmOwnerOrders from './pages/FarmOwner/Orders';
import FarmOwnerSettings from './pages/FarmOwner/Settings';
import { FarmOwnerLayout } from './components/layout/FarmOwnerLayout';

// Admin page imports
import AdminDashboard from './pages/Admin/Dashboard';
import AdminFarms from './pages/Admin/Farms';
import AdminProducts from './pages/Admin/Products';
import AdminMealPlans from './pages/Admin/MealPlans';
import AdminOrders from './pages/Admin/Orders';
import { AdminLayout } from './components/layout/AdminLayout';

import { CartAnimationProvider } from './context/CartAnimationContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartAnimationProvider>
          <HashRouter>
            <Routes>
              {/* Customer Facing Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/farms" element={<Shop />} />
                <Route path="/farms/:id" element={<FarmDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/meal-plans" element={<MealPlans />} />
                {/* Add a catch-all route if needed */}
                <Route path="*" element={<Home />} />
              </Route>

              {/* FarmOwner Admin Seller Routes */}
              <Route path="/farm-owner" element={<FarmOwnerLayout />}>
                <Route path="dashboard" element={<FarmOwnerDashboard />} />
                <Route path="inventory" element={<FarmOwnerInventory />} />
                <Route path="orders" element={<FarmOwnerOrders />} />
                <Route path="settings" element={<FarmOwnerSettings />} />
                <Route path="*" element={<FarmOwnerDashboard />} />
              </Route>

              {/* System Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="farms" element={<AdminFarms />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="meal-plans" element={<AdminMealPlans />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="*" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </HashRouter>
        </CartAnimationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
