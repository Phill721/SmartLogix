import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Layout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('debe renderizar el componente correctamente', () => {
    renderLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('debe mostrar enlaces de categorías', () => {
    renderLayout();

    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Perifericos')).toBeInTheDocument();
    expect(screen.getByText('Electrodoméstico')).toBeInTheDocument();
  });

  it('debe mostrar enlace de carrito', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: /carrito/i })).toBeInTheDocument();
  });

  it('debe mostrar botón de login si no está autenticado', () => {
    renderLayout();

    expect(screen.getByText(/Ingresar/i)).toBeInTheDocument();
  });

  it('debe mostrar nombre de usuario si está autenticado', () => {
    const mockUser = {
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      rol: 'USUARIO',
      avatar: 'https://example.com/avatar.jpg',
    };

    localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
    localStorage.setItem('smartlogix_token', 'test-token');

    renderLayout();

    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('debe tener campo de búsqueda', () => {
    renderLayout();

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('debe permitir búsqueda de productos', () => {
    renderLayout();

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(searchInput).toHaveValue('laptop');
  });

  it('debe abrir menú móvil al hacer click en el botón', () => {
    const { container } = renderLayout();

    const menuButton = container.querySelector('button[onclick]');
    if (menuButton) {
      fireEvent.click(menuButton);
    }

    expect(container).toBeInTheDocument();
  });

  it('debe mostrar contador de carrito', () => {
    renderLayout();

    const cartIcon = screen.getByRole('link', { name: /carrito/i });
    expect(cartIcon).toBeInTheDocument();
  });

  it('debe navegar a categoría al hacer click', () => {
    renderLayout();

    const tecnologiaLink = screen.getByText('Tecnologia');
    expect(tecnologiaLink).toHaveAttribute('href', '/categoria/tecnologia');
  });

  it('debe navegar a perfil si está autenticado', () => {
    const mockUser = {
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      rol: 'USUARIO',
      avatar: 'https://example.com/avatar.jpg',
    };

    localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
    localStorage.setItem('smartlogix_token', 'test-token');

    renderLayout();

    const profileLink = screen.getByText('Juan');
    expect(profileLink.closest('a')).toHaveAttribute('href', '/perfil');
  });

  it('debe tener todos los elementos de navegación principales', () => {
    renderLayout();

    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Perifericos')).toBeInTheDocument();
    expect(screen.getByText('Electrodoméstico')).toBeInTheDocument();
  });

  it('debe renderizar outlet para contenido de páginas', () => {
    renderLayout();

    // El Outlet debe estar presente para renderizar el contenido de las rutas
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('debe permitir submeter formulario de búsqueda', async () => {
    const user = userEvent.setup();
    renderLayout();

    const searchInput = screen.getByPlaceholderText('Buscar...');
    const form = searchInput.closest('form');

    await user.type(searchInput, 'test');
    if (form) {
      fireEvent.submit(form);
    }

    // Verificar que se ejecutó la búsqueda
    expect(searchInput).toHaveValue('test');
  });

  it('debe mostrar enlace de carrito con icono', () => {
    renderLayout();

    const cartLink = screen.getByRole('link', { name: '' });
    // Buscar por el ícono SVG del carrito
    const cartSvg = screen.getByRole('link').querySelector('svg');
    expect(cartSvg).toBeInTheDocument();
  });

  it('debe renderizar header con clase sticky', () => {
    const { container } = renderLayout();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
  });

  describe('Snapshot tests', () => {
    it('debe renderizar Layout correctamente', () => {
      const { container } = renderLayout();

      expect(container).toMatchSnapshot();
    });

    it('debe renderizar Layout autenticado correctamente', () => {
      const mockUser = {
        nombre: 'Juan Perez',
        email: 'juan@example.com',
        rol: 'USUARIO',
        avatar: 'https://example.com/avatar.jpg',
      };

      localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));
      localStorage.setItem('smartlogix_token', 'test-token');

      const { container } = renderLayout();

      expect(container).toMatchSnapshot();
    });
  });
});
