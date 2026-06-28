import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async () => {
    const token = localStorage.getItem('smartlogix_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/bff/productos?page=0&size=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('No se pudo extraer el catálogo central.');

      const data = await response.json();
      const listaReal = data.content || data || [];
      setProducts(listaReal);
      setError(null);
    } catch (err) {
      console.error("SmartLogix Catalog Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // =========================================================================
  // FUNCIONES RESTAURADAS PARA QUE EL INICIO CARGUE
  // =========================================================================
  const getProductsByCategory = (cat) => {
    return products.filter(p => (p.categoria || p.category || '').toLowerCase() === cat.toLowerCase());
  };

  const getProductBySku = (skuConsultado) => {
    return products.find(p => (p.sku || '').toLowerCase() === (skuConsultado || '').toLowerCase());
  };

  // =========================================================================
  // COREOGRAFÍA DE ALTA (Blindado)
  // =========================================================================
  const crearNuevoProducto = async (form) => {
    const token = localStorage.getItem('smartlogix_token');
    if (!token) throw new Error("Sesión expirada.");

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const skuLimpio = form.sku.toUpperCase().trim();

    const dtoProducto = {
      sku: skuLimpio,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio) || 0,
      categoria: form.categoria.toLowerCase(),
      imagenes: [form.imagenUrl || "https://placehold.co/600x400?text=SmartLogix"]
    };

    const resProd = await fetch('/api/bff/productos', {
      method: 'POST',
      headers,
      body: JSON.stringify(dtoProducto)
    });

    if (!resProd.ok) {
      const errorData = await resProd.text();
      throw new Error(`Rechazo en Catálogo: ${errorData || resProd.statusText}`);
    }

    const productoGuardado = await resProd.json();

    const cantidadNumerica = parseInt(form.stock, 10);
    const stockSeguro = isNaN(cantidadNumerica) ? 0 : cantidadNumerica;

    const dtoInventario = {
      sku: skuLimpio,
      productoId: productoGuardado.id || Math.floor(Math.random() * 89999) + 10000,
      bodegaId: 1,
      cantidad: stockSeguro,
      stockTotal: stockSeguro,
      stockInicial: stockSeguro,
      umbralMinimo: 5
    };

    const resInv = await fetch('/api/bff/inventario', {
      method: 'POST',
      headers,
      body: JSON.stringify(dtoInventario)
    });

    if (!resInv.ok) {
      throw new Error("Producto creado en catálogo, pero falló la reserva en bodega.");
    }

    await cargarProductos();
    return productoGuardado;
  };

  const actualizarProducto = async (sku, form) => {
    const token = localStorage.getItem('smartlogix_token');
    const skuLimpio = sku.toUpperCase().trim();

    const dtoEdicion = {
      sku: skuLimpio,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio) || 0,
      categoria: form.categoria.toLowerCase(),
      imagenes: [form.imagenUrl || "https://placehold.co/600x400?text=SmartLogix"]
    };

    const response = await fetch(`/api/bff/productos/${skuLimpio}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dtoEdicion)
    });

    if (!response.ok) throw new Error(await response.text());
    await cargarProductos();
    return await response.json();
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      getProductsByCategory, 
      getProductBySku,       
      crearNuevoProducto,
      actualizarProducto,
      recargarCatalogo: cargarProductos 
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  return useContext(ProductContext);
}