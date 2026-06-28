import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('smartlogix_cart');
    return localData ? JSON.parse(localData) : [];
  });

  const [notificacion, setNotificacion] = useState(null);
  const temporizadorRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('smartlogix_cart', JSON.stringify(cart));
  }, [cart]);

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    setNotificacion({ tipo, titulo, mensaje });
    temporizadorRef.current = setTimeout(() => setNotificacion(null), 3000);
  };

  // ADAPTADO AL AGREGARALCARRITOREQUESTDTO DE TU MICROSERVICIO DE PEDIDOS
  const addProduct = (productoBackend) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.sku === productoBackend.sku);
      const techoStock = productoBackend.stock !== undefined ? productoBackend.stock : 20;

      if (existingItem) {
        if (existingItem.cantidad + 1 > techoStock) {
          mostrarNotificacion('error', 'Tope de Bodega', `Solo quedan ${techoStock} unidades disponibles.`);
          return prevCart;
        }

        mostrarNotificacion('success', '¡Cantidad actualizada!', productoBackend.nombre || productoBackend.name);
        return prevCart.map((item) =>
          item.sku === productoBackend.sku
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      mostrarNotificacion('success', '¡Agregado al carrito!', productoBackend.nombre || productoBackend.name);
      
      return [
        ...prevCart,
        {
          sku: productoBackend.sku,
          nombreProducto: productoBackend.nombre || productoBackend.name,
          cantidad: 1,
          precioUnitario: productoBackend.precio !== undefined ? productoBackend.precio : productoBackend.price,
          imagenUrl: productoBackend.imagenes?.[0] || productoBackend.image || ''
        },
      ];
    });
  };

  const removeProduct = (sku) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // ACTUALIZAR CANTIDAD CON CANDADO DE STOCK FÍSICO
  const updateQuantity = (sku, amount, maxStock = 20) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.sku === sku) {
          const nuevaCantidad = item.cantidad + amount;
          
          if (nuevaCantidad < 1) return item;
          if (nuevaCantidad > maxStock) {
            mostrarNotificacion('error', 'Stock máximo', `Límite de ${maxStock} unidades alcanzado.`);
            return item;
          }

          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}

      {/* TOAST NOTIFICATION */}
      {notificacion && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-86 z-[9999] animate-fade-in">
          <div className={`border-2 border-black rounded-2xl p-4 bg-white text-slate-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
            notificacion.tipo === 'error' ? 'bg-red-50' : 'bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              notificacion.tipo === 'error' ? 'bg-red-600' : 'bg-emerald-500'
            }`}></div>
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">{notificacion.titulo}</span>
              <p className="text-xs font-bold truncate text-slate-800">{notificacion.mensaje}</p>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}