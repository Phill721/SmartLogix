import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductProvider } from '../../context/ProductContext';

// Helper para usar el contexto
function TestProductComponent() {
  return (
    <div data-testid="test-component">
      <p>Product Provider Test</p>
    </div>
  );
}

describe('ProductContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  describe('ProductProvider - Initialization', () => {
    it('debe renderizar sin errores', () => {
      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('debe inicializar con estado vacío', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('debe hacer llamada a API al montar el componente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/bff/productos'),
          expect.any(Object)
        );
      });
    });

    it('debe incluir token en headers si existe', async () => {
      localStorage.setItem('smartlogix_token', 'test-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0][1];
        expect(callArgs.headers.Authorization).toContain('test-token');
      });
    });

    it('debe manejar error en la carga inicial', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Snapshot tests', () => {
    it('debe renderizar ProductProvider correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});
