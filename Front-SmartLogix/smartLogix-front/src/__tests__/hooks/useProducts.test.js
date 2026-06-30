import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useProducts } from '../../hooks/useProducts';
import { ProductProvider } from '../../context/ProductContext';

// Componente de prueba para useProducts
function TestUseProductsComponent() {
  const { products, loading, error } = useProducts();

  if (loading) return <div data-testid="loading">Cargando...</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <div>
      <div data-testid="product-count">{products.length}</div>
      {products.map((p) => (
        <div key={p.sku} data-testid={`product-${p.sku}`}>
          {p.nombre}
        </div>
      ))}
    </div>
  );
}

describe('useProducts hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('debe retornar estado inicial de carga', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(
      <ProductProvider>
        <TestUseProductsComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-count')).toBeInTheDocument();
    });
  });

  it('debe cargar productos desde la API', async () => {
    const mockProducts = {
      content: [
        { sku: 'PROD001', nombre: 'Laptop', precio: 1000 },
        { sku: 'PROD002', nombre: 'Mouse', precio: 50 },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(
      <ProductProvider>
        <TestUseProductsComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-count')).toHaveTextContent('2');
    });
  });

  it('debe manejar errores de carga', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <ProductProvider>
        <TestUseProductsComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });

  it('debe retornar un objeto con propiedades esperadas', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    let contextValue;

    function CaptureComponent() {
      contextValue = useProducts();
      return <div data-testid="capture">captured</div>;
    }

    render(
      <ProductProvider>
        <CaptureComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(contextValue).toHaveProperty('products');
      expect(contextValue).toHaveProperty('loading');
      expect(contextValue).toHaveProperty('error');
    });
  });

  describe('Snapshot tests', () => {
    it('debe renderizar componente con useProducts correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ sku: 'PROD001', nombre: 'Laptop', precio: 1000 }],
        }),
      });

      const { container } = render(
        <ProductProvider>
          <TestUseProductsComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });
  });
});
