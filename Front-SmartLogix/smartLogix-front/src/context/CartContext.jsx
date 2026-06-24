import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Inicializamos el carrito con localStorage para que no se borre al recargar
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('smartlogix_cart');
    return localData ? JSON.parse(localData) : [];
  });

  // ESTADO PARA LA NOTIFICACIÓN FLOTANTE (Toast)
  const [notificacion, setNotificacion] = useState(null);
  const temporizadorRef = useRef(null);

  // Sincronizar con localStorage
  useEffect(() => {
    localStorage.setItem('smartlogix_cart', JSON.stringify(cart));
  }, [cart]);

  // Función interna para activar la notificación y hacer que se apague sola a los 3 segundos
  const mostrarNotificacion = (tipo, titulo, mensaje, imagen) => {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    
    setNotificacion({ tipo, titulo, mensaje, imagen });
    
    temporizadorRef.current = setTimeout(() => {
      setNotificacion(null);
    }, 3000);
  };

  // AGREGAR AL CARRITO
  const addProduct = (product) => {
    setCart((prevCart) => {
      const stockDisponible = product.stock !== undefined ? product.stock : 99;
      const existingItem = prevCart.find((item) => item.id === product.id);

      const tituloProd = product.nombre || product.name;
      const imagenProd = product.imagenes?.[0] || product.image;

      if (existingItem) {
        // Si ya no queda stock logístico disponible
        if (existingItem.quantity >= stockDisponible) {
          mostrarNotificacion(
            'error',
            'Límite de Stock',
            `SmartLogix no registra más de ${stockDisponible} unidades de este ítem.`,
            null
          );
          return prevCart;
        }

        // Si se suma uno más de un ítem existente
        mostrarNotificacion('success', '¡Añadido otra vez!', tituloProd, imagenProd);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // Si es un producto completamente nuevo en el carrito
      mostrarNotificacion('success', '¡Agregado al carrito!', tituloProd, imagenProd);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // ELIMINAR UN PRODUCTO
  const removeProduct = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // ACTUALIZAR CANTIDADES DESDE LA VISTA DEL CARRITO
  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          const itemStock = item.stock !== undefined ? item.stock : 99;

          if (newQty > itemStock) {
            mostrarNotificacion('error', 'Stock Insuficiente', `Límite logístico de ${itemStock} unidades.`, null);
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // VACIAR EL CARRITO
  const clearCart = () => setCart([]);

  // CÁLCULOS MATEMÁTICOS EN TIEMPO REAL
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const precio = item.precio !== undefined ? item.precio : (item.price || 0);
    return total + (precio * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}

      {/* =========================================================================
         NOTIFICACIÓN POPUP (TOAST) NE-BRUTALISTA CON TAILWIND
         ========================================================================= */}
      {notificacion && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-[9999] animate-fade-in">
          <div 
            className={`border-2 border-black rounded-2xl p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 ${
              notificacion.tipo === 'success' ? 'bg-white text-slate-900' : 'bg-red-500 text-white'
            }`}
          >
            {/* Imagen del producto en miniatura (Si es exitoso) */}
            {notificacion.tipo === 'success' && notificacion.imagen ? (
              <div className="w-12 h-12 bg-[#EBEFF2] border border-black/20 rounded-xl p-1 flex items-center justify-center shrink-0 bg-white">
                <img src={notificacion.imagen} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center shrink-0 text-xl font-black">
                ⚠️
              </div>
            )}

            {/* Mensajes */}
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-black uppercase tracking-wider block ${
                notificacion.tipo === 'success' ? 'text-[#1E3859]' : 'text-red-100'
              }`}>
                {notificacion.titulo}
              </span>
              <p className="text-xs font-bold truncate leading-tight mt-0.5">
                {notificacion.mensaje}
              </p>
            </div>

            {/* Botón de cierre manual o link rápido */}
            {notificacion.type === 'success' ? (
              <Link
                to="/carrito"
                className="bg-[#1E3859] text-white text-[11px] font-black px-3 py-2 rounded-xl border border-black shadow-sm hover:opacity-90"
              >
                Ver 🛒
              </Link>
            ) : (
              <button 
                onClick={() => setNotificacion(null)} 
                className="text-xs font-black p-1 hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}