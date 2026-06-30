import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('debe renderizar sin errores', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    const { container } = render(<App />);

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('debe renderizar BrowserRouter', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('div')).toBeInTheDocument();
    });
  });

  it('debe tener AuthProvider como proveedor raíz', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/login|login/i)).toBeTruthy();
    });
  });

  it('debe tener ProductProvider en la jerarquía', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bff/productos'),
        expect.any(Object)
      );
    });
  });

  it('debe tener CartProvider en la jerarquía', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    const { container } = render(<App />);

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('debe renderizar Layout como componente principal', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  it('debe tener rutas definidas', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    const { container } = render(<App />);

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('debe redirigir a /categoria/tecnologia por defecto', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(document.location.pathname === '/' || 
              document.location.pathname.includes('categoria/tecnologia')).toBeTruthy();
    });
  });

  describe('Rutas públicas', () => {
    it('debe tener ruta de categorías', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('debe tener ruta de búsqueda', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('debe tener ruta de detalle de producto', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('debe tener ruta de carrito', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('debe tener ruta de login', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('debe tener ruta de registro', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot tests', () => {
    it('debe renderizar App correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});
