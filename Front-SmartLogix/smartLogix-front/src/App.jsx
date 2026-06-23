import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import { CartProvider } from './context/CartContext';

const ProfilePage = () => <div className="p-8 text-2xl font-bold">Perfil de Usuario (HU-FE-USR-03)</div>;

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/categoria/tecnologia" replace />} />
            <Route path="categoria/:categoryName" element={<CatalogPage />} />
            <Route path="producto/:id" element={<ProductDetailPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="carrito" element={<CartPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}