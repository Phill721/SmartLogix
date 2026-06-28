import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// VISTAS PÚBLICAS
import Layout from './components/layout/Layout';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';

// VISTAS DE COMPRA
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// VISTAS DE USUARIO
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
// GUARDIÁN MULTI-ROL
import ProtectedRoute from './components/auth/ProtectedRoute';

// CONTEXTOS (Los 3 Cerebros de SmartLogix)
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext'; // <-- AGREGADO
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider> {/* <-- ENVOLTORIO DE PRODUCTOS CONECTADO A MICROSERVICIOS */}
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                
                {/* =========================================================
                   NIVEL 0: ACCESO PÚBLICO (Cualquiera entra)
                   ========================================================= */}
                <Route index element={<Navigate to="/categoria/tecnologia" replace />} />
                <Route path="categoria/:categoryName" element={<CatalogPage />} />
                <Route path="/producto/:sku" element={<ProductDetailPage />} />
                <Route path="buscar" element={<SearchPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />

                {/* =========================================================
                   NIVEL 1: CONTROL TOTAL (Exclusivo Administrador)
                   ========================================================= */}
                <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
                  <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="admin/inventario" element={<AdminInventoryPage />} /> 
                </Route>

                {/* =========================================================
                   NIVEL 2: USUARIOS AUTENTICADOS (Cualquier rol con sesión)
                   ========================================================= */}
                <Route element={<ProtectedRoute allowedRoles={['USUARIO', 'VENDEDOR', 'ADMINISTRADOR']} />}>
                  <Route path="perfil" element={<ProfilePage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="exito" element={<OrderSuccessPage />} />
                  {/* (Ya no está aquí abajo) */}
                </Route>

              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}