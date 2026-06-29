import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarPedidos, obtenerPedido, cancelarPedido } from '../services/pedidosService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADO_META = {
  PENDIENTE:   { color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',   dot: 'bg-amber-400',   label: 'Pendiente'   },
  CONFIRMADO:  { color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-200',     dot: 'bg-blue-400',    label: 'Confirmado'  },
  EN_PROCESO:  { color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200',   dot: 'bg-violet-400',  label: 'En proceso'  },
  ENVIADO:     { color: 'text-cyan-600',    bg: 'bg-cyan-50    border-cyan-200',      dot: 'bg-cyan-400',    label: 'Enviado'     },
  ENTREGADO:   { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',  dot: 'bg-emerald-400', label: 'Entregado'   },
  CANCELADO:   { color: 'text-rose-600',    bg: 'bg-rose-50    border-rose-200',      dot: 'bg-rose-400',    label: 'Cancelado'   },
};

const meta = (estado) =>
  ESTADO_META[estado] ?? { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', label: estado ?? '—' };

const formatPeso = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0);

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
};

// ─── Barra de progreso del estado ─────────────────────────────────────────────

const PASOS = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO'];

function ProgresoEstado({ estado }) {
  if (estado === 'CANCELADO') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
        <span className="text-rose-700 font-bold text-xs font-mono uppercase tracking-wider">Pedido Cancelado</span>
      </div>
    );
  }

  const idx = PASOS.indexOf(estado);
  return (
    <div className="flex items-center gap-1">
      {PASOS.map((paso, i) => {
        const completado = i <= idx;
        const activo = i === idx;
        const m = meta(paso);
        return (
          <React.Fragment key={paso}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                activo ? `${m.dot} border-transparent` : completado ? 'bg-slate-300 border-transparent' : 'bg-white border-slate-200'
              }`}>
                {completado && !activo && <span className="text-white text-[8px] font-black">✓</span>}
                {activo && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-[8px] font-mono font-bold uppercase hidden sm:block ${activo ? m.color : completado ? 'text-slate-400' : 'text-slate-300'}`}>
                {m.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 rounded-full transition-all ${i < idx ? 'bg-slate-300' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Tarjeta de pedido expandible ────────────────────────────────────────────

function TarjetaPedido({ resumen, token, onCancelado }) {
  const [abierto, setAbierto]         = useState(false);
  const [detalle, setDetalle]         = useState(null);
  const [cargando, setCargando]       = useState(false);
  const [cancelando, setCancelando]   = useState(false);
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [error, setError]             = useState('');

  const cargarDetalle = async () => {
    if (detalle) { setAbierto((v) => !v); return; }
    setCargando(true);
    try {
      const data = await obtenerPedido(token, resumen.id);
      setDetalle(data);
      setAbierto(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async () => {
    setCancelando(true);
    setConfirmarModal(false);
    try {
      const actualizado = await cancelarPedido(token, resumen.id);
      setDetalle(actualizado);
      onCancelado(resumen.id, actualizado.estado);
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelando(false);
    }
  };

  const estadoActual = detalle?.estado ?? resumen.estado;
  const m = meta(estadoActual);
  const cancelable = ['PENDIENTE', 'CONFIRMADO'].includes(estadoActual);

  return (
    <>
      <div className={`bg-white border rounded-2xl overflow-hidden drop-shadow-[0_4px_12px_rgba(30,56,89,0.08)] transition-all ${
        abierto ? 'border-[#1E3859]/30' : 'border-slate-200'
      }`}>

        {/* Cabecera siempre visible */}
        <button
          onClick={cargarDetalle}
          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-all cursor-pointer"
        >
          <div className="shrink-0">
            <span className="font-mono text-[10px] text-slate-400 block">PEDIDO</span>
            <span className="font-mono font-black text-slate-800">#{resumen.id}</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 border text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${m.bg} ${m.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {m.label}
          </div>

          <div className="flex-1 min-w-0 hidden sm:block">
            <span className="font-mono text-[10px] text-slate-400 block">Fecha</span>
            <span className="text-xs text-slate-600">{formatFecha(resumen.fechaCreacion)}</span>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-[10px] text-slate-400 block">Total</span>
            <span className="font-mono font-black text-slate-900">{formatPeso(resumen.total)}</span>
          </div>

          <span className={`text-slate-400 text-xs shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}>
            {cargando ? '⏳' : '▾'}
          </span>
        </button>

        {/* Detalle expandible */}
        {abierto && detalle && (
          <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5">

            {/* Progreso */}
            <ProgresoEstado estado={estadoActual} />

            {/* Items */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Productos</span>
              <div className="space-y-2">
                {(detalle.items ?? []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="overflow-hidden">
                      <span className="font-mono text-[10px] text-emerald-600 font-bold block">{item.sku}</span>
                      <span className="text-sm text-slate-800 font-bold truncate block">{item.nombreProducto}</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-[10px] font-mono text-slate-400 block">×{item.cantidad}</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{formatPeso(item.precioUnitario)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-[#1E3859] text-white rounded-2xl px-5 py-3.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">Total del pedido</span>
              <span className="font-mono font-black text-2xl text-amber-300">{formatPeso(detalle.total)}</span>
            </div>

            {/* Motivo rechazo */}
            {detalle.motivoRechazo && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <span className="text-[10px] font-mono text-rose-600 font-bold block mb-1">MOTIVO DE CANCELACIÓN</span>
                <p className="text-xs text-rose-700">{detalle.motivoRechazo}</p>
              </div>
            )}

            {/* Error inline */}
            {error && (
              <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">❌ {error}</p>
            )}

            {/* Cancelar */}
            {cancelable && (
              <button
                onClick={() => setConfirmarModal(true)}
                disabled={cancelando}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {cancelando ? 'Cancelando...' : '✖ Solicitar cancelación'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal confirmación cancelación */}
      {confirmarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-black text-slate-900 text-base">¿Cancelar pedido?</h3>
                <span className="text-[10px] font-mono text-slate-400">Pedido #{resumen.id}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Esta acción no puede deshacerse. El pedido pasará a estado <strong>CANCELADO</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl cursor-pointer transition-all">
                Volver
              </button>
              <button onClick={handleCancelar} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MisPedidosPage() {
  const { token, user } = useAuth();

  const [pedidos, setPedidos]       = useState([]);
  const [paginacion, setPaginacion] = useState({ page: 0, size: 10, totalPages: 0, total: 0 });
  const [filtro, setFiltro]         = useState('TODOS');
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState('');

  const FILTROS = ['TODOS', 'PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

  const cargar = useCallback(async (page = 0, estado = filtro) => {
    setCargando(true);
    setError('');
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
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [token, filtro, paginacion.size]);

  useEffect(() => { cargar(0, filtro); }, [filtro]); // eslint-disable-line

  const onCancelado = (id, nuevoEstado) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">

      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block font-bold">SmartLogix · Mi Cuenta</span>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">Mis Pedidos</h1>
        {user?.email && (
          <span className="font-mono text-xs text-slate-500">{user.email}</span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTROS.map((f) => {
          const m = meta(f);
          const activo = filtro === f;
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activo
                  ? f === 'TODOS' ? 'bg-[#1E3859] text-white border-[#1E3859]' : `${m.bg} ${m.color}`
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : m.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-800 mb-4">
          ❌ {error}
        </div>
      )}

      {/* Listado */}
      {cargando ? (
        <div className="text-center py-20 text-slate-400 font-mono text-xs">
          <span className="animate-spin inline-block mr-2">⏳</span> Cargando tus pedidos...
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-black text-slate-700 text-sm uppercase tracking-wide">Sin pedidos</p>
          <p className="font-mono text-xs text-slate-400 mt-1">
            {filtro === 'TODOS' ? 'Aún no has realizado ningún pedido.' : `No tienes pedidos en estado "${filtro}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <TarjetaPedido key={p.id} resumen={p} token={token} onCancelado={onCancelado} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            disabled={paginacion.page === 0}
            onClick={() => cargar(paginacion.page - 1)}
            className="px-4 py-2 text-[11px] font-mono font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-[11px] font-mono text-slate-500">
            {paginacion.page + 1} / {paginacion.totalPages}
          </span>
          <button
            disabled={paginacion.page + 1 >= paginacion.totalPages}
            onClick={() => cargar(paginacion.page + 1)}
            className="px-4 py-2 text-[11px] font-mono font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
