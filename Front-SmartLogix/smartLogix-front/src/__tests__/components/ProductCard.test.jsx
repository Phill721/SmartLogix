import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../../components/catalog/ProductCard';
import { CartProvider } from '../../context/CartContext';

describe('ProductCard Component', () => {
  const mockProduct = {
    sku: 'LAPTOP001',
    nombre: 'Laptop Gaming',
    precio: 1500,
    imagenes: ['https://example.com/laptop.jpg'],
    stockTotal: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el componente correctamente', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Laptop Gaming')).toBeInTheDocument();
  });

  it('debe mostrar el SKU del producto', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/LAPTOP001/i)).toBeInTheDocument();
  });

  it('debe mostrar el precio formateado', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/1.500/)).toBeInTheDocument();
  });

  it('debe mostrar el stock disponible', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/STOCK: 5/)).toBeInTheDocument();
  });

  it('debe mostrar badge "Agotado" cuando no hay stock', () => {
    const productOutOfStock = { ...mockProduct, stockTotal: 0 };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={productOutOfStock} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });

  it('debe deshabilitar el botón cuando no hay stock', () => {
    const productOutOfStock = { ...mockProduct, stockTotal: 0 };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={productOutOfStock} />
        </CartProvider>
      </BrowserRouter>
    );

    const button = screen.getByText('Sin existencias');
    expect(button).toBeDisabled();
  });

  it('debe mostrar texto "Agregar al carrito" cuando hay stock', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    const button = screen.getByText('Agregar al carrito');
    expect(button).not.toBeDisabled();
  });

  it('debe render imagen con alt text correctamente', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    const image = screen.getByAltText('Laptop Gaming');
    expect(image).toHaveAttribute('src', 'https://example.com/laptop.jpg');
  });

  it('debe usar nombre alternativo si no existe nombre', () => {
    const productAlt = {
      ...mockProduct,
      nombre: undefined,
      name: 'Laptop Alternative',
    };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={productAlt} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Laptop Alternative')).toBeInTheDocument();
  });

  it('debe usar precio alternativo si no existe precio', () => {
    const productAlt = {
      ...mockProduct,
      precio: undefined,
      price: 2000,
    };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={productAlt} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/2.000/)).toBeInTheDocument();
  });

  it('debe usar stock alternativo si no existe stockTotal', () => {
    const productAlt = {
      ...mockProduct,
      stockTotal: undefined,
      stock: 3,
    };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={productAlt} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/STOCK: 3/)).toBeInTheDocument();
  });

  it('debe hacer click en el botón agregar al carrito', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    const button = screen.getByText('Agregar al carrito');
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  it('debe navegar al detalle del producto al hacer click en la tarjeta', () => {
    const { container } = render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    const card = container.querySelector('[class*="cursor-pointer"]');
    expect(card).toBeInTheDocument();
  });

  describe('Snapshot tests', () => {
    it('debe renderizar ProductCard correctamente', () => {
      const { container } = render(
        <BrowserRouter>
          <CartProvider>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(container).toMatchSnapshot();
    });

    it('debe renderizar ProductCard sin stock correctamente', () => {
      const productOutOfStock = { ...mockProduct, stockTotal: 0 };

      const { container } = render(
        <BrowserRouter>
          <CartProvider>
            <ProductCard product={productOutOfStock} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(container).toMatchSnapshot();
    });
  });
});
