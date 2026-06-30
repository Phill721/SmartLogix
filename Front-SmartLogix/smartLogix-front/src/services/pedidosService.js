const PEDIDOS_BASE = '/api/bff/pedidos';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
});

// ─── CARRITO ────────────────────────────────────────────────────────────────

export const obtenerCarrito = async (token) => {
  const res = await fetch(`${PEDIDOS_BASE}/carrito`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al obtener el carrito');
  return res.json();
};

export const agregarAlCarrito = async (token, { sku, nombreProducto, cantidad, precioUnitario }) => {
  const res = await fetch(`${PEDIDOS_BASE}/carrito/agregar`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ sku, nombreProducto, cantidad, precioUnitario }),
  });
  if (!res.ok) throw new Error('Error al agregar al carrito');
  return res.json();
};

export const removerDelCarrito = async (token, itemId) => {
  const res = await fetch(`${PEDIDOS_BASE}/carrito/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al remover del carrito');
  return res.json();
};

export const actualizarCantidad = async (token, itemId, cantidad) => {
  const res = await fetch(
    `${PEDIDOS_BASE}/carrito/items/${itemId}?cantidad=${cantidad}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(token),
    }
  );
  if (!res.ok) throw new Error('Error al actualizar cantidad');
  return res.json();
};

export const vaciarCarrito = async (token) => {
  const res = await fetch(`${PEDIDOS_BASE}/carrito/vaciar`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al vaciar el carrito');
};

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────

export const crearPedido = async (token, { carritoId, items }) => {
  const res = await fetch(`${PEDIDOS_BASE}/pedidos`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ carritoId, items }),
  });
  if (!res.ok) throw new Error('Error al crear el pedido');
  return res.json();
};

export const confirmarPedido = async (token, pedidoId) => {
  const res = await fetch(`${PEDIDOS_BASE}/pedidos/${pedidoId}/confirmar`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al confirmar el pedido');
  return res.json();
};

export const cancelarPedido = async (token, pedidoId) => {
  const res = await fetch(`${PEDIDOS_BASE}/pedidos/${pedidoId}/cancelar`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al cancelar el pedido');
  return res.json();
};

export const obtenerPedido = async (token, pedidoId) => {
  const res = await fetch(`${PEDIDOS_BASE}/pedidos/${pedidoId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al obtener el pedido');
  return res.json();
};

export const listarPedidos = async (
  token,
  { page = 0, size = 20, estado } = {}
) => {
  const params = new URLSearchParams({ page, size });
  if (estado) params.set('estado', estado);

  const res = await fetch(`${PEDIDOS_BASE}/pedidos?${params}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al listar pedidos');
  return res.json();
};