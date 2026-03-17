import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Page imports
import Home from './pages/Home';
import Shop from './pages/Shop';
import FarmDetail from './pages/FarmDetail';
import Checkout from './pages/Checkout';
import MealPlans from './pages/MealPlans';

import { CartAnimationProvider } from './context/CartAnimationContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartAnimationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/farms" element={<Shop />} />
                <Route path="/farms/:id" element={<FarmDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/meal-plans" element={<MealPlans />} />
                {/* Add a catch-all route if needed */}
                <Route path="*" element={<Home />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartAnimationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
