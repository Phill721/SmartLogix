import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('smartlogix_cart');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('smartlogix_cart', JSON.stringify(cart));
  }, [cart]);

  const addProduct = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const stockDisponible = product.stock !== undefined ? product.stock : 99;
        
        if (newCart[existingIndex].quantity < stockDisponible) {
          newCart[existingIndex].quantity += 1;
        } else {
          alert(`Lo sentimos, SmartLogix no registra más stock disponible para ${product.nombre || product.name}.`);
        }
        return newCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeProduct = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          const itemStock = item.stock !== undefined ? item.stock : 99;
          
          if (newQty > itemStock) {
            alert(`Máximo stock logístico alcanzado (${itemStock} unidades)`);
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const precio = item.precio !== undefined ? item.precio : (item.price || 0);
    return total + (precio * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}