import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Vistas
import Layout from './components/layout/Layout';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';


import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPedidosPage from './pages/AdminPedidosPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminVentasPage from './pages/AdminVentasPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/categoria/tecnologia" replace />} />
                <Route path="categoria/:categoryName" element={<CatalogPage />} />
                <Route path="/producto/:sku" element={<ProductDetailPage />} />
                <Route path="buscar" element={<SearchPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />

                {/* Nivel Administrativo */}
                <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
                  <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="admin/usuarios" element={<AdminUsersPage />} />
                  <Route path="admin/pedidos" element={<AdminPedidosPage />} />
                  <Route path="admin/ventas" element={<AdminVentasPage />} />
                </Route>

                {/* Nivel Operativo (Admin + Vendedor) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']} />}>
                  <Route path="admin/inventario" element={<AdminInventoryPage />} />
                  <Route path="vendedor/dashboard" element={<SellerDashboardPage />} />
                </Route>

                {/* Nivel Usuario */}
                <Route element={<ProtectedRoute allowedRoles={['USUARIO', 'VENDEDOR', 'ADMINISTRADOR']} />}>
                  <Route path="perfil" element={<ProfilePage />} />
                  <Route path="usuario/pedidos" element={<UserDashboardPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="exito" element={<OrderSuccessPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}