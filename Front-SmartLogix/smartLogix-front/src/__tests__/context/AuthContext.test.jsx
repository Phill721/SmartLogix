import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Componente de prueba que usa el hook
function TestComponent() {
  const { user, token, isAuthenticated, login, logout, register } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Autenticado' : 'No autenticado'}
      </div>
      {user && <div data-testid="user-name">{user.nombre}</div>}
      {token && <div data-testid="token">{token}</div>}
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <button
        onClick={() => login('test@example.com', 'password123')}
        data-testid="login-btn"
      >
        Login
      </button>
      <button
        onClick={() => register('Test User', 'test@example.com', 'password123')}
        data-testid="register-btn"
      >
        Register
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  describe('AuthProvider - Initialization', () => {
    it('debe inicializar con usuario no autenticado', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'No autenticado'
      );
    });

    it('debe cargar usuario desde localStorage si existe', () => {
      const mockUser = {
        nombre: 'Juan Perez',
        email: 'juan@example.com',
        rol: 'USUARIO',
      };
      const mockToken = 'existing-token-123';

      localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
      localStorage.setItem('smartlogix_token', mockToken);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Autenticado'
      );
      expect(screen.getByTestId('user-name')).toHaveTextContent('Juan Perez');
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });

    it('debe inicializar con estado isAuthenticated como false sin token', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'No autenticado'
      );
    });
  });

  describe('login', () => {
    it('debe autenticar usuario con credenciales correctas', async () => {
      const mockResponse = {
        token: 'new-token-123',
        nombre: 'Test User',
        rol: 'USUARIO',
        permisos: ['read'],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'Autenticado'
        );
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(localStorage.getItem('smartlogix_token')).toBe('new-token-123');
    });

    it('debe lanzar error con credenciales incorrectas', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'No autenticado'
        );
      });
    });

    it('debe guardar token y usuario en localStorage', async () => {
      const mockResponse = {
        token: 'saved-token-123',
        nombre: 'Saved User',
        rol: 'VENDEDOR',
        permisos: ['read', 'write'],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(localStorage.getItem('smartlogix_token')).toBe(
          'saved-token-123'
        );
        expect(JSON.parse(localStorage.getItem('smartlogix_user')).nombre).toBe(
          'Saved User'
        );
      });
    });

    it('debe hacer llamada al endpoint correcto', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'token',
          nombre: 'Test',
          rol: 'USUARIO',
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bff/usuarios/login',
          expect.any(Object)
        );
      });
    });
  });

  describe('logout', () => {
    it('debe limpiar datos de usuario y token', async () => {
      const mockUser = {
        nombre: 'Juan Perez',
        email: 'juan@example.com',
        rol: 'USUARIO',
      };

      localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
      localStorage.setItem('smartlogix_token', 'token-123');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Autenticado'
      );

      fireEvent.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'No autenticado'
        );
      });

      expect(localStorage.getItem('smartlogix_token')).toBeNull();
      expect(localStorage.getItem('smartlogix_user')).toBeNull();
    });

    it('debe limpiar localStorage', async () => {
      localStorage.setItem('smartlogix_token', 'token-123');
      localStorage.setItem('smartlogix_user', JSON.stringify({ nombre: 'Test' }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(localStorage.getItem('smartlogix_token')).toBeNull();
        expect(localStorage.getItem('smartlogix_user')).toBeNull();
      });
    });
  });

  describe('register', () => {
    it('debe registrar nuevo usuario exitosamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bff/usuarios/register',
          expect.any(Object)
        );
      });
    });

    it('debe lanzar error con datos inválidos', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email ya registrado' }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('debe establecer rol USUARIO por defecto', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.rol).toBe('USUARIO');
      });
    });
  });

  describe('useAuth hook', () => {
    it('debe retornar contexto de autenticación', () => {
      let contextValue;

      function CaptureContextComponent() {
        contextValue = useAuth();
        return <div>Test</div>;
      }

      render(
        <AuthProvider>
          <CaptureContextComponent />
        </AuthProvider>
      );

      expect(contextValue).toHaveProperty('user');
      expect(contextValue).toHaveProperty('token');
      expect(contextValue).toHaveProperty('isAuthenticated');
      expect(contextValue).toHaveProperty('login');
      expect(contextValue).toHaveProperty('logout');
      expect(contextValue).toHaveProperty('register');
    });

    it('debe lanzar error si se usa fuera de AuthProvider', () => {
      function InvalidComponent() {
        try {
          useAuth();
          return <div>Test</div>;
        } catch (error) {
          return <div>Error</div>;
        }
      }

      expect(() => {
        render(<InvalidComponent />);
      }).toThrow();
    });
  });

  describe('Snapshot tests', () => {
    it('debe renderizar AuthProvider correctamente', () => {
      const { container } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });
});
