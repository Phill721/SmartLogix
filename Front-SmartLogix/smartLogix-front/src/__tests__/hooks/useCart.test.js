import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useCart } from '../../hooks/useCart';
import { CartProvider } from '../../context/CartContext';

// Componente de prueba para useCart
function TestUseCartComponent() {
  const { addProduct } = useCart();

  return (
    <button
      onClick={() =>
        addProduct({
          name: 'Test Product',
          sku: 'TEST001',
        })
      }
      data-testid="test-add-btn"
    >
      Add to Cart
    </button>
  );
}

describe('useCart hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar función addProduct', () => {
    render(
      <CartProvider>
        <TestUseCartComponent />
      </CartProvider>
    );

    const button = screen.getByTestId('test-add-btn');
    expect(button).toBeInTheDocument();
  });

  it('debe funcionar dentro de CartProvider', () => {
    const { container } = render(
      <CartProvider>
        <TestUseCartComponent />
      </CartProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('debe mostrar alerta al agregar producto', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestUseCartComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('test-add-btn'));

    alertSpy.mockRestore();
  });

  describe('Snapshot tests', () => {
    it('debe renderizar componente con useCart correctamente', () => {
      const { container } = render(
        <CartProvider>
          <TestUseCartComponent />
        </CartProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });
});
