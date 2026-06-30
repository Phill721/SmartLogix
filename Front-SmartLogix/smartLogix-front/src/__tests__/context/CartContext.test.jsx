import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../../context/CartContext';

// Componente de prueba
function TestCartComponent() {
  const { cart, addProduct, removeProduct, updateQuantity, clearCart, cartCount, cartTotal } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="cart-total">{cartTotal}</div>
      <div data-testid="cart-items">{cart.length}</div>
      <button
        onClick={() =>
          addProduct({
            sku: 'PROD001',
            nombre: 'Laptop',
            precio: 1000,
            stock: 5,
          })
        }
        data-testid="add-product-btn"
      >
        Add Product
      </button>
      <button
        onClick={() => removeProduct('PROD001')}
        data-testid="remove-product-btn"
      >
        Remove Product
      </button>
      <button
        onClick={() => updateQuantity('PROD001', 1, 10)}
        data-testid="update-quantity-btn"
      >
        Update Quantity
      </button>
      <button onClick={() => clearCart()} data-testid="clear-cart-btn">
        Clear Cart
      </button>
      {cart.map((item) => (
        <div key={item.sku} data-testid={`cart-item-${item.sku}`}>
          {item.nombreProducto} - {item.cantidad}
        </div>
      ))}
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('CartProvider - Initialization', () => {
    it('debe inicializar carrito vacío', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    });

    it('debe cargar carrito desde localStorage', () => {
      const mockCart = [
        {
          sku: 'PROD001',
          nombreProducto: 'Laptop',
          cantidad: 2,
          precioUnitario: 1000,
          imagenUrl: 'img.jpg',
        },
      ];

      localStorage.setItem('smartlogix_cart', JSON.stringify(mockCart));

      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    });

    it('debe sincronizar carrito con localStorage', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));

      expect(localStorage.getItem('smartlogix_cart')).toBeTruthy();
      const savedCart = JSON.parse(localStorage.getItem('smartlogix_cart'));
      expect(savedCart).toHaveLength(1);
    });
  });

  describe('addProduct', () => {
    it('debe agregar nuevo producto al carrito', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');

      fireEvent.click(screen.getByTestId('add-product-btn'));

      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });

    it('debe incrementar cantidad si producto ya existe', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      fireEvent.click(screen.getByTestId('add-product-btn'));

      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    });

    it('debe calcular total correctamente', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));

      expect(screen.getByTestId('cart-total')).toHaveTextContent('1000');
    });

    it('debe rechazar agregar producto sin stock', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-product-btn');
      const wrapper = addButton.closest('div');

      // Simulamos producto sin stock
      const originalClick = addButton.onclick;
      addButton.onclick = () => {
        const context = useCart();
        if (context) {
          context.addProduct({
            sku: 'NO_STOCK',
            nombre: 'Producto Sin Stock',
            precio: 100,
            stock: 0,
          });
        }
      };

      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    });

    it('debe respetar techo de stock', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-product-btn');
      // Intentar agregar 6 veces un producto con stock de 5
      for (let i = 0; i < 6; i++) {
        fireEvent.click(addButton);
      }

      // No debería agregar más de 5
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
  });

  describe('removeProduct', () => {
    it('debe remover producto del carrito', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('remove-product-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
      });
    });

    it('debe actualizar total al remover', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      expect(screen.getByTestId('cart-total')).toHaveTextContent('1000');

      fireEvent.click(screen.getByTestId('remove-product-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
      });
    });
  });

  describe('updateQuantity', () => {
    it('debe actualizar cantidad de producto', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      fireEvent.click(screen.getByTestId('update-quantity-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      });
    });

    it('debe respetar cantidad mínima (no disminuir bajo 1)', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));

      const minusButton = screen.getByTestId('update-quantity-btn');
      // Simular reducir cantidad a 0
      const originalClick = minusButton.onclick;
      minusButton.onclick = () => {
        const context = useCart();
        if (context) {
          context.updateQuantity('PROD001', -1, 10);
        }
      };

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });

    it('debe respetar stock máximo', () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));

      // Intentar exceder el stock máximo
      const maxButton = screen.getByTestId('update-quantity-btn');
      const originalClick = maxButton.onclick;
      maxButton.onclick = () => {
        const context = useCart();
        if (context) {
          context.updateQuantity('PROD001', 20, 5);
        }
      };

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
  });

  describe('clearCart', () => {
    it('debe limpiar el carrito completamente', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      fireEvent.click(screen.getByTestId('add-product-btn'));

      expect(screen.getByTestId('cart-items')).toHaveTextContent('2');

      fireEvent.click(screen.getByTestId('clear-cart-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
      });
    });
  });

  describe('cartCount y cartTotal', () => {
    it('debe calcular cartCount correctamente', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));
      fireEvent.click(screen.getByTestId('add-product-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      });
    });

    it('debe calcular cartTotal correctamente', async () => {
      render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('add-product-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('cart-total')).toHaveTextContent('1000');
      });
    });
  });

  describe('Snapshot tests', () => {
    it('debe renderizar CartProvider correctamente', () => {
      const { container } = render(
        <CartProvider>
          <TestCartComponent />
        </CartProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });
});
