import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// VISTAS PÚBLICAS
import Layout from './components/layout/Layout';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage'; // <-- AGREGADO

// VISTAS DE COMPRA
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// VISTAS DE USUARIO
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/auth/AdminRoute';

// CONTEXTOS
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/categoria/tecnologia" replace />} />
              <Route path="categoria/:categoryName" element={<CatalogPage />} />
              <Route path="producto/:id" element={<ProductDetailPage />} />
              
              <Route path="buscar" element={<SearchPage />} /> {/* <-- RUTA ACTIVA */}

              <Route path="carrito" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="exito" element={<OrderSuccessPage />} />

              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegisterPage />} />
              <Route path="perfil" element={<ProfilePage />} />

              <Route 
                path="admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}