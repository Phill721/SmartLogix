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

  const actualizarStock = async (sku, cantidadComprada) => {
    const token = localStorage.getItem('smartlogix_token');
    const skuLimpio = sku.toUpperCase().trim();

    // 1. Consultar stock real desde inventario
    const resInv = await fetch(`/api/bff/inventario/${skuLimpio}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!resInv.ok) throw new Error(`No se pudo consultar inventario de ${skuLimpio}`);
    const inventario = await resInv.json();

    const stockActual = inventario.stockTotal ?? 0;
    const nuevoStock = Math.max(0, stockActual - cantidadComprada);

    // 2. Actualizar con el stock meta correcto
    const response = await fetch(`/api/bff/inventario/${skuLimpio}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cantidad: nuevoStock,
        motivo: 'Venta online SmartLogix'
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Falló la sincronización de inventario: ${txt}`);
    }

    await cargarProductos();
  };

  const crearNuevoProducto = async (form) => {
    const token = localStorage.getItem('smartlogix_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const skuLimpio = form.sku.toUpperCase().trim();

    const imagenesLimpias = (form.imagenes || [])
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const dtoProducto = {
      sku: skuLimpio,
      nombre: form.nombre,
      precio: parseFloat(form.precio) || 0,
      categoria: form.categoria.toLowerCase(),
      descripcion: form.descripcion || '',
      imagenes: imagenesLimpias.length > 0
        ? imagenesLimpias
        : ["https://placehold.co/600x400?text=SmartLogix"]
    };

    const resProd = await fetch('/api/bff/productos', { method: 'POST', headers, body: JSON.stringify(dtoProducto) });
    if (!resProd.ok) {
      const txt = await resProd.text();
      throw new Error(`[${resProd.status}] ${txt || 'Error en catálogo'}`);
    }

    const cantidadNumerica = parseInt(form.stock, 10);
    const dtoInventario = {
      sku: skuLimpio,
      stockTotal: cantidadNumerica,
      umbralMinimo: 0,
      bodegaId: 1
    };

    const resInv = await fetch('/api/bff/inventario', { method: 'POST', headers, body: JSON.stringify(dtoInventario) });
    if (!resInv.ok) {
      const txt = await resInv.text();
      throw new Error(`[${resInv.status}] ${txt || 'Error en inventario'}`);
    }

    await cargarProductos();
  };

  const actualizarProducto = async (sku, form) => {
    const token = localStorage.getItem('smartlogix_token');
    const skuLimpio = sku.toUpperCase().trim();

    const imagenesLimpias = (form.imagenes || [])
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const dtoEdicion = {
      sku: skuLimpio,
      nombre: form.nombre,
      precio: parseFloat(form.precio) || 0,
      categoria: form.categoria.toLowerCase(),
      descripcion: form.descripcion || '',
      imagenes: imagenesLimpias.length > 0
        ? imagenesLimpias
        : ["https://placehold.co/600x400?text=SmartLogix"]
    };

    const response = await fetch(`/api/bff/productos/${skuLimpio}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(dtoEdicion)
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`[${response.status}] ${txt || 'Error editando producto'}`);
    }

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