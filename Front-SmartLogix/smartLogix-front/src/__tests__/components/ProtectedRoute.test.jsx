import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock del componente Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Protected Content</div>,
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('debe redirigir a login si no está autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('debe mostrar contenido si está autenticado y tiene rol permitido', async () => {
    const mockUser = {
      nombre: 'Admin User',
      email: 'admin@example.com',
      rol: 'ADMINISTRADOR',
    };

    localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
    localStorage.setItem('smartlogix_token', 'test-token');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        nombre: 'Admin User',
        rol: 'ADMINISTRADOR',
      }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />
        </AuthProvider>
      </BrowserRouter>
    );

    setTimeout(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    }, 100);
  });

  it('debe redirigir si está autenticado pero no tiene rol permitido', () => {
    const mockUser = {
      nombre: 'Regular User',
      email: 'user@example.com',
      rol: 'USUARIO',
    };

    localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
    localStorage.setItem('smartlogix_token', 'test-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('debe permitir múltiples roles', () => {
    const mockUser = {
      nombre: 'Seller User',
      email: 'seller@example.com',
      rol: 'VENDEDOR',
    };

    localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
    localStorage.setItem('smartlogix_token', 'test-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'VENDEDOR']} />
        </AuthProvider>
      </BrowserRouter>
    );

    setTimeout(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    }, 100);
  });

  describe('Snapshot tests', () => {
    it('debe renderizar ProtectedRoute correctamente cuando no está autenticado', () => {
      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(container).toMatchSnapshot();
    });
  });
});
