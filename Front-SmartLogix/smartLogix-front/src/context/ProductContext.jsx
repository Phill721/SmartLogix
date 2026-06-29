import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async () => {
    const token = localStorage.getItem('smartlogix_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      setLoading(true);
      const response = await fetch('/api/bff/productos?page=0&size=50', { method: 'GET', headers });
      if (!response.ok) throw new Error('No se pudo extraer el catálogo central.');

      const data = await response.json();
      const listaReal = data.content || data || [];
      setProducts(listaReal);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const getProductsByCategory = (cat) => {
    return products.filter(p => (p.categoria || p.category || '').toLowerCase() === cat.toLowerCase());
  };

  const getProductBySku = (skuConsultado) => {
    return products.find(p => (p.sku || '').toLowerCase() === (skuConsultado || '').toLowerCase());
  };

  // NUEVA FUNCIÓN: Sincroniza el ajuste de stock con el BFF
  const actualizarStock = async (sku, cantidadTotal) => {
    const token = localStorage.getItem('smartlogix_token');
    const response = await fetch(`/api/bff/inventario/${sku}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cantidad: cantidadTotal })
    });

    if (!response.ok) throw new Error("Falló la sincronización de inventario");
    
    // Recargamos todo para asegurar consistencia tras el PUT
    await cargarProductos();
  };

  const crearNuevoProducto = async (form) => {
    const token = localStorage.getItem('smartlogix_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const skuLimpio = form.sku.toUpperCase().trim();

    const dtoProducto = {
      sku: skuLimpio,
      nombre: form.nombre,
      precio: parseFloat(form.precio) || 0,
      categoria: form.categoria.toLowerCase(),
      imagenes: [form.imagenUrl || "https://placehold.co/600x400?text=SmartLogix"]
    };

    const resProd = await fetch('/api/bff/productos', { method: 'POST', headers, body: JSON.stringify(dtoProducto) });
    if (!resProd.ok) throw new Error("Error en catálogo");

    const cantidadNumerica = parseInt(form.stock, 10);
    const dtoInventario = { sku: skuLimpio, cantidad: cantidadNumerica, bodegaId: 1 };

    await fetch('/api/bff/inventario', { method: 'POST', headers, body: JSON.stringify(dtoInventario) });
    await cargarProductos();
  };

  const actualizarProducto = async (sku, form) => {
    const token = localStorage.getItem('smartlogix_token');
    const skuLimpio = sku.toUpperCase().trim();
    const dtoEdicion = { sku: skuLimpio, nombre: form.nombre, precio: parseFloat(form.precio) || 0, categoria: form.categoria.toLowerCase() };

    const response = await fetch(`/api/bff/productos/${skuLimpio}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(dtoEdicion)
    });

    if (!response.ok) throw new Error("Error editando producto");
    await cargarProductos();
  };

  const eliminarProducto = async (sku) => {
    const token = localStorage.getItem('smartlogix_token');
    const skuLimpio = sku.toUpperCase().trim();
    await fetch(`/api/bff/productos/${skuLimpio}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setProducts((prev) => prev.filter((p) => p.sku !== skuLimpio));
  };

  return (
    <ProductContext.Provider value={{ 
      products, loading, error, 
      getProductsByCategory, getProductBySku, 
      crearNuevoProducto, actualizarProducto, eliminarProducto, actualizarStock,
      loadProducts: cargarProductos 
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  return useContext(ProductContext);
}