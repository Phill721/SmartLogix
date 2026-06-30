import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as pedidosService from '../../services/pedidosService';

describe('pedidosService', () => {
  const mockToken = 'test-token-123';
  const mockBearerToken = 'Bearer test-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Headers y autenticación', () => {
    it('debe incluir Authorization header con Bearer token', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await pedidosService.obtenerCarrito(mockToken);

      expect(global.fetch).toHaveBeenCalled();
      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('debe agregar Bearer si el token no lo incluye', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await pedidosService.obtenerCarrito('simple-token');

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer simple-token');
    });
  });

  describe('obtenerCarrito', () => {
    it('debe hacer fetch al endpoint correcto', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      });

      await pedidosService.obtenerCarrito(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/carrito',
        expect.any(Object)
      );
    });

    it('debe retornar datos del carrito', async () => {
      const mockCarrito = [{ sku: 'PROD001', cantidad: 2 }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCarrito,
      });

      const resultado = await pedidosService.obtenerCarrito(mockToken);

      expect(resultado).toEqual(mockCarrito);
    });

    it('debe lanzar error si la respuesta no es ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        pedidosService.obtenerCarrito(mockToken)
      ).rejects.toThrow('Error al obtener el carrito');
    });
  });

  describe('agregarAlCarrito', () => {
    it('debe agregar producto al carrito correctamente', async () => {
      const itemData = {
        sku: 'PROD001',
        nombreProducto: 'Laptop',
        cantidad: 1,
        precioUnitario: 1200,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const resultado = await pedidosService.agregarAlCarrito(
        mockToken,
        itemData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/carrito/agregar',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(itemData),
        })
      );
      expect(resultado).toEqual({ success: true });
    });

    it('debe lanzar error si falla agregar producto', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.agregarAlCarrito(mockToken, {
          sku: 'PROD001',
          nombreProducto: 'Laptop',
          cantidad: 1,
          precioUnitario: 1200,
        })
      ).rejects.toThrow('Error al agregar al carrito');
    });
  });

  describe('removerDelCarrito', () => {
    it('debe remover item del carrito', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await pedidosService.removerDelCarrito(mockToken, 'item-123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/carrito/items/item-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('debe lanzar error si falla remover', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.removerDelCarrito(mockToken, 'item-123')
      ).rejects.toThrow('Error al remover del carrito');
    });
  });

  describe('actualizarCantidad', () => {
    it('debe actualizar cantidad de item', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cantidad: 5 }),
      });

      const resultado = await pedidosService.actualizarCantidad(
        mockToken,
        'item-123',
        5
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/carrito/items/item-123?cantidad=5',
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(resultado.cantidad).toBe(5);
    });

    it('debe lanzar error si falla actualizar cantidad', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.actualizarCantidad(mockToken, 'item-123', 5)
      ).rejects.toThrow('Error al actualizar cantidad');
    });
  });

  describe('vaciarCarrito', () => {
    it('debe vaciar el carrito', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      await pedidosService.vaciarCarrito(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/carrito/vaciar',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('debe lanzar error si falla vaciar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(pedidosService.vaciarCarrito(mockToken)).rejects.toThrow(
        'Error al vaciar el carrito'
      );
    });
  });

  describe('crearPedido', () => {
    it('debe crear un nuevo pedido', async () => {
      const pedidoData = {
        carritoId: 'cart-123',
        items: [{ sku: 'PROD001', cantidad: 2 }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'pedido-123' }),
      });

      const resultado = await pedidosService.crearPedido(
        mockToken,
        pedidoData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/pedidos',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(pedidoData),
        })
      );
      expect(resultado.id).toBe('pedido-123');
    });

    it('debe lanzar error si falla crear pedido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.crearPedido(mockToken, {
          carritoId: 'cart-123',
          items: [],
        })
      ).rejects.toThrow('Error al crear el pedido');
    });
  });

  describe('confirmarPedido', () => {
    it('debe confirmar un pedido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ estado: 'confirmado' }),
      });

      const resultado = await pedidosService.confirmarPedido(
        mockToken,
        'pedido-123'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/pedidos/pedido-123/confirmar',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(resultado.estado).toBe('confirmado');
    });

    it('debe lanzar error si falla confirmar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.confirmarPedido(mockToken, 'pedido-123')
      ).rejects.toThrow('Error al confirmar el pedido');
    });
  });

  describe('cancelarPedido', () => {
    it('debe cancelar un pedido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ estado: 'cancelado' }),
      });

      const resultado = await pedidosService.cancelarPedido(
        mockToken,
        'pedido-123'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/pedidos/pedido-123/cancelar',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(resultado.estado).toBe('cancelado');
    });

    it('debe lanzar error si falla cancelar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.cancelarPedido(mockToken, 'pedido-123')
      ).rejects.toThrow('Error al cancelar el pedido');
    });
  });

  describe('obtenerPedido', () => {
    it('debe obtener detalles de un pedido', async () => {
      const mockPedido = { id: 'pedido-123', estado: 'entregado' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPedido,
      });

      const resultado = await pedidosService.obtenerPedido(
        mockToken,
        'pedido-123'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/pedidos/pedidos/pedido-123',
        expect.any(Object)
      );
      expect(resultado).toEqual(mockPedido);
    });

    it('debe lanzar error si falla obtener pedido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.obtenerPedido(mockToken, 'pedido-123')
      ).rejects.toThrow('Error al obtener el pedido');
    });
  });

  describe('listarPedidos', () => {
    it('debe listar pedidos con paginación por defecto', async () => {
      const mockPedidos = [{ id: 'pedido-1' }, { id: 'pedido-2' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPedidos,
      });

      await pedidosService.listarPedidos(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bff/pedidos/pedidos?page=0&size=20'),
        expect.any(Object)
      );
    });

    it('debe listar pedidos con parámetros personalizados', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await pedidosService.listarPedidos(mockToken, {
        page: 1,
        size: 50,
        estado: 'entregado',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('size=50'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('estado=entregado'),
        expect.any(Object)
      );
    });

    it('debe lanzar error si falla listar pedidos', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        pedidosService.listarPedidos(mockToken)
      ).rejects.toThrow('Error al listar pedidos');
    });
  });
});
