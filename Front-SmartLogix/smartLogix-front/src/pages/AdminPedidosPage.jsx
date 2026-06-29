import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  listarPedidos,
  obtenerPedido,
  confirmarPedido,
  cancelarPedido,
} from '../services/pedidosService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADOS = ['TODOS', 'PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const ESTADO_META = {
  PENDIENTE:   { color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',   dot: 'bg-amber-400'   },
  CONFIRMADO:  { color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-200',     dot: 'bg-blue-400'    },
  EN_PROCESO:  { color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200',   dot: 'bg-violet-400'  },
  ENVIADO:     { color: 'text-cyan-600',    bg: 'bg-cyan-50    border-cyan-200',      dot: 'bg-cyan-400'    },
  ENTREGADO:   { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',  dot: 'bg-emerald-400' },
  CANCELADO:   { color: 'text-rose-600',    bg: 'bg-rose-50    border-rose-200',      dot: 'bg-rose-400'    },
};

const meta = (estado) => ESTADO_META[estado] ?? { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };

const formatPeso = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0);

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Badge de estado ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const m = meta(estado);
  return (
    <span className={`inline-flex items-center gap-1.5 border text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${m.bg} ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {estado ?? 'DESCONOCIDO'}
    </span>
  );
}

// ─── Panel de detalle de pedido ───────────────────────────────────────────────

function DetallePedido({ pedido, onConfirmar, onCancelar, cargandoAccion }) {
  if (!pedido) return null;

  return (
    <div className="bg-[#1E3859] text-white rounded-3xl p-6 border border-slate-700/40 drop-shadow-[0_20px_35px_rgba(30,56,89,0.25)]">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-5">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest block">PEDIDO #{pedido.id}</span>
          <h3 className="text-base font-black uppercase tracking-tight mt-0.5">Ficha Técnica</h3>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Usuario ID: {pedido.usuarioId}</span>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {/* Items */}
      <div className="mb-5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Líneas de Pedido</span>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {(pedido.items ?? []).map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <span className="font-mono text-[10px] text-emerald-400 font-bold block">{item.sku}</span>
                <span className="text-xs text-slate-200 truncate block">{item.nombreProducto}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-slate-400 block">×{item.cantidad}</span>
                <span className="font-mono font-black text-amber-300 text-xs">{formatPeso(item.precioUnitario)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex justify-between items-center mb-5">
        <span className="font-mono text-[11px] text-slate-300 uppercase tracking-wider">Total del Pedido</span>
        <span className="font-mono font-black text-2xl text-amber-300">{formatPeso(pedido.total)}</span>
      </div>

      {/* Historial */}
      {pedido.historial?.length > 0 && (
        <div className="mb-5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Historial de Estados</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {pedido.historial.map((h, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${meta(h.estado).dot}`} />
                <span className={`text-[10px] font-mono font-bold uppercase ${meta(h.estado).color.replace('600','400')}`}>{h.estado}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-auto shrink-0">{formatFecha(h.fecha)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivo rechazo */}
      {pedido.motivoRechazo && (
        <div className="bg-rose-900/30 border border-rose-700/40 rounded-2xl p-3 mb-5">
          <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">MOTIVO DE RECHAZO</span>
          <p className="text-xs text-rose-200">{pedido.motivoRechazo}</p>
        </div>
      )}

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-2 mb-5 text-[10px] font-mono">
        <div className="bg-white/5 rounded-xl p-2.5">
          <span className="text-slate-500 block">Creado</span>
          <span className="text-slate-300 font-bold">{formatFecha(pedido.fechaCreacion)}</span>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <span className="text-slate-500 block">Actualizado</span>
          <span className="text-slate-300 font-bold">{formatFecha(pedido.fechaActualizacion)}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-2 border-t border-white/10">
        {pedido.estado === 'PENDIENTE' && (
          <button
            onClick={() => onConfirmar(pedido.id)}
            disabled={cargandoAccion}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-60"
          >
            {cargandoAccion ? 'Procesando...' : '✅ Confirmar'}
          </button>
        )}
        {['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado) && (
          <button
            onClick={() => onCancelar(pedido.id)}
            disabled={cargandoAccion}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-60"
          >
            {cargandoAccion ? 'Procesando...' : '✖ Cancelar'}
          </button>
        )}
        {!['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado) && (
          <p className="text-center w-full text-[10px] font-mono text-slate-500 py-2">Sin acciones disponibles para este estado.</p>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminPedidosPage() {
  const { token, user } = useAuth();

  const [pedidos, setPedidos]             = useState([]);
  const [paginacion, setPaginacion]       = useState({ page: 0, size: 20, total: 0, totalPages: 0 });
  const [filtroEstado, setFiltroEstado]   = useState('TODOS');
  const [cargando, setCargando]           = useState(false);
  const [alerta, setAlerta]              = useState({ tipo: '', texto: '' });

  const [pedidoDetalle, setPedidoDetalle]       = useState(null);
  const [cargandoDetalle, setCargandoDetalle]   = useState(false);
  const [cargandoAccion, setCargandoAccion]     = useState(false);

  // ── Carga listado ──────────────────────────────────────────────────────────
  const cargarPedidos = useCallback(async (page = 0, estado = filtroEstado) => {
    setCargando(true);
    setAlerta({ tipo: '', texto: '' });
    try {
      const estadoParam = estado === 'TODOS' ? undefined : estado;
      const data = await listarPedidos(token, { page, size: paginacion.size, estado: estadoParam });
      setPedidos(data.content ?? []);
      setPaginacion((prev) => ({
        ...prev,
        page: data.number ?? page,
        total: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 1,
      }));
    } catch (err) {
      setAlerta({ tipo: 'error', texto: err.message });
    } finally {
      setCargando(false);
    }
  }, [token, filtroEstado, paginacion.size]);

  useEffect(() => {
    cargarPedidos(0, filtroEstado);
  }, [filtroEstado]); // eslint-disable-line

  // ── Ver detalle ────────────────────────────────────────────────────────────
  const verDetalle = async (id) => {
    if (pedidoDetalle?.id === id) { setPedidoDetalle(null); return; }
    setCargandoDetalle(true);
    try {
      const data = await obtenerPedido(token, id);
      setPedidoDetalle(data);
    } catch (err) {
      setAlerta({ tipo: 'error', texto: err.message });
    } finally {
      setCargandoDetalle(false);
    }
  };

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirmar = async (id) => {
    setCargandoAccion(true);
    try {
      const actualizado = await confirmarPedido(token, id);
      setPedidoDetalle(actualizado);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: actualizado.estado } : p)));
      setAlerta({ tipo: 'exito', texto: `Pedido #${id} confirmado correctamente.` });
    } catch (err) {
      setAlerta({ tipo: 'error', texto: err.message });
    } finally {
      setCargandoAccion(false);
    }
  };

  // ── Cancelar ───────────────────────────────────────────────────────────────
  const handleCancelar = async (id) => {
    setCargandoAccion(true);
    try {
      const actualizado = await cancelarPedido(token, id);
      setPedidoDetalle(actualizado);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: actualizado.estado } : p)));
      setAlerta({ tipo: 'exito', texto: `Pedido #${id} cancelado.` });
    } catch (err) {
      setAlerta({ tipo: 'error', texto: err.message });
    } finally {
      setCargandoAccion(false);
    }
  };

  // ── Stats rápidas ──────────────────────────────────────────────────────────
  const countPor = (estado) => pedidos.filter((p) => p.estado === estado).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E3859] text-white p-8 rounded-3xl drop-shadow-[0_15px_25px_rgba(30,56,89,0.25)] mb-8 border border-slate-700/30">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-bold">Terminal Logística v2.4</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase mt-1">Centro de Mando SmartLogix</h1>
        </div>
        <div className="mt-4 sm:mt-0 text-right font-mono text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <span className="block text-slate-300 text-[10px]">OPERADOR ACTIVO:</span>
          <span className="font-bold text-amber-300">{user?.email || 'Admin'} [{user?.rol}]</span>
        </div>
      </div>

      {/* ── Navegación ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Link to="/admin/usuarios" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">👥 Usuarios</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link to="/admin/inventario" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">📦 Kardex (8083)</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-2xl flex items-center justify-between opacity-60">
          <span className="text-xs font-black text-slate-500 uppercase">📊 Ventas</span>
        </div>
        <div className="bg-[#1E3859] border border-[#1E3859] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase">🚚 Pedidos Globales</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* ── Alerta ── */}
      {alerta.texto && (
        <div className={`p-4 rounded-2xl border font-bold text-xs mb-6 ${
          alerta.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {alerta.tipo === 'exito' ? '✅ ' : '❌ '}{alerta.texto}
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map((e) => {
          const m = meta(e);
          return (
            <button
              key={e}
              onClick={() => setFiltroEstado(e === filtroEstado ? 'TODOS' : e)}
              className={`border rounded-2xl p-3 text-left transition-all cursor-pointer ${
                filtroEstado === e ? `${m.bg} ${m.color} scale-[1.03] drop-shadow-md` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full block mb-2 ${m.dot}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider block">{e}</span>
              <span className="font-black text-xl">{countPor(e)}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Tabla de pedidos ── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl drop-shadow-[0_20px_35px_rgba(30,56,89,0.10)] overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">🚚 Pedidos Globales</h2>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {paginacion.total} registros · página {paginacion.page + 1} de {Math.max(paginacion.totalPages, 1)}
              </p>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="text-[11px] font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer"
              >
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <button
                onClick={() => cargarPedidos(paginacion.page)}
                className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                ↺ Recargar
              </button>
            </div>
          </div>

          {/* Listado */}
          {cargando ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-mono text-xs">
              <span className="animate-spin mr-2">⏳</span> Cargando registros...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-mono text-xs">Sin pedidos para el filtro seleccionado.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pedidos.map((p) => {
                const activo = pedidoDetalle?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => verDetalle(p.id)}
                    className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all cursor-pointer group ${
                      activo ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* ID */}
                    <div className="shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">ID</span>
                      <span className="font-mono font-black text-slate-800 text-sm">#{p.id}</span>
                    </div>

                    {/* Estado */}
                    <div className="shrink-0">
                      <EstadoBadge estado={p.estado} />
                    </div>

                    {/* Fecha */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <span className="font-mono text-[10px] text-slate-400 block">Creado</span>
                      <span className="font-mono text-xs text-slate-600 truncate block">{formatFecha(p.fechaCreacion)}</span>
                    </div>

                    {/* Total */}
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-[10px] text-slate-400 block">Total</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{formatPeso(p.total)}</span>
                    </div>

                    {/* Chevron */}
                    <span className={`text-slate-300 text-xs shrink-0 transition-transform ${activo ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}>
                      {activo ? '▼' : '›'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {paginacion.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
              <button
                disabled={paginacion.page === 0}
                onClick={() => cargarPedidos(paginacion.page - 1)}
                className="px-3 py-1.5 text-[11px] font-mono font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1.5 text-[11px] font-mono text-slate-500">
                {paginacion.page + 1} / {paginacion.totalPages}
              </span>
              <button
                disabled={paginacion.page + 1 >= paginacion.totalPages}
                onClick={() => cargarPedidos(paginacion.page + 1)}
                className="px-3 py-1.5 text-[11px] font-mono font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* ── Panel detalle ── */}
        <div>
          {cargandoDetalle ? (
            <div className="bg-[#1E3859] rounded-3xl p-8 flex items-center justify-center text-slate-400 font-mono text-xs border border-slate-700/40 min-h-[200px]">
              <span className="animate-spin mr-2">⏳</span> Cargando ficha...
            </div>
          ) : pedidoDetalle ? (
            <DetallePedido
              pedido={pedidoDetalle}
              onConfirmar={handleConfirmar}
              onCancelar={handleCancelar}
              cargandoAccion={cargandoAccion}
            />
          ) : (
            <div className="bg-[#1E3859]/30 border border-slate-200 rounded-3xl p-8 text-center text-slate-400">
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-mono text-xs">Selecciona un pedido<br />para ver su ficha técnica.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
