import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProductContext } from '../context/ProductContext';
import { listarPedidos } from '../services/pedidosService';

export default function SellerDashboardPage() {
  const { user, token } = useAuth();
  const { products } = useProductContext();

  const [resumenPedidos, setResumenPedidos] = useState({
    PENDIENTE: 0, CONFIRMADO: 0, EN_PROCESO: 0,
    ENVIADO: 0, ENTREGADO: 0, CANCELADO: 0, total: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await listarPedidos(token, { page: 0, size: 100 });
        const lista = data.content ?? [];
        const counts = { PENDIENTE: 0, CONFIRMADO: 0, EN_PROCESO: 0, ENVIADO: 0, ENTREGADO: 0, CANCELADO: 0 };
        lista.forEach((p) => { if (counts[p.estado] !== undefined) counts[p.estado]++; });
        setResumenPedidos({ ...counts, total: lista.length });
      } catch (_) {
        // silencioso
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token]);

  const stockBajo = products.filter((p) => (p.stockTotal ?? p.stock ?? 0) <= 5);
  const sinStock  = products.filter((p) => (p.stockTotal ?? p.stock ?? 0) === 0);

  const ESTADO_META = {
    PENDIENTE:  { color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',   dot: 'bg-amber-400',   label: 'Pendiente'  },
    CONFIRMADO: { color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-200',     dot: 'bg-blue-400',    label: 'Confirmado' },
    EN_PROCESO: { color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200',   dot: 'bg-violet-400',  label: 'En Proceso' },
    ENVIADO:    { color: 'text-cyan-600',    bg: 'bg-cyan-50    border-cyan-200',     dot: 'bg-cyan-400',    label: 'Enviado'    },
    ENTREGADO:  { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',  dot: 'bg-emerald-400', label: 'Entregado'  },
    CANCELADO:  { color: 'text-rose-600',    bg: 'bg-rose-50    border-rose-200',     dot: 'bg-rose-400',    label: 'Cancelado'  },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans select-none">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E3859] text-white p-8 rounded-3xl drop-shadow-[0_15px_25px_rgba(30,56,89,0.25)] mb-8 border border-slate-700/30">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-bold">Terminal Logística v2.4</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase mt-1">Panel de Vendedor</h1>
        </div>
        <div className="mt-4 sm:mt-0 text-right font-mono text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <span className="block text-slate-300 text-[10px]">OPERADOR ACTIVO:</span>
          <span className="font-bold text-amber-300">{user?.email || 'Vendedor'} [{user?.rol}]</span>
        </div>
      </div>

      {/* ── Accesos rápidos ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/admin/inventario" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">📦 Kardex</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link to="/admin/pedidos" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">🚚 Pedidos</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed col-span-2 sm:col-span-1">
          <span className="text-xs font-black text-slate-500 uppercase">📊 Ventas</span>
        </div>
      </div>

      {/* ── Métricas principales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        {/* Total productos */}
        <div className="bg-[#1E3859] text-white p-6 rounded-3xl border border-slate-700/40 drop-shadow-[0_20px_35px_rgba(30,56,89,0.25)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-3">Catálogo</span>
          <span className="text-4xl font-black font-mono text-amber-300">{products.length}</span>
          <span className="text-xs font-mono text-slate-300 block mt-1">SKUs en base de datos</span>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] font-mono">
            <span className="text-rose-400 font-bold">⚠ {sinStock.length} sin stock</span>
            <span className="text-amber-400 font-bold">↓ {stockBajo.length} stock bajo</span>
          </div>
        </div>

        {/* Pedidos activos */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-3">Pedidos Activos</span>
          {cargando ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <span className="text-4xl font-black font-mono text-[#1E3859]">
              {resumenPedidos.PENDIENTE + resumenPedidos.CONFIRMADO + resumenPedidos.EN_PROCESO}
            </span>
          )}
          <span className="text-xs font-mono text-slate-400 block mt-1">pendientes + confirmados + en proceso</span>
          <Link to="/admin/pedidos" className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1 text-[10px] font-mono font-bold text-[#1E3859] hover:underline">
            Gestionar pedidos →
          </Link>
        </div>

        {/* Entregados */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-3">Completados</span>
          {cargando ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <span className="text-4xl font-black font-mono text-emerald-600">{resumenPedidos.ENTREGADO}</span>
          )}
          <span className="text-xs font-mono text-slate-400 block mt-1">pedidos entregados</span>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] font-mono text-rose-500 font-bold">
            ✖ {resumenPedidos.CANCELADO} cancelados
          </div>
        </div>
      </div>

      {/* ── Desglose por estado + Alertas de stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Desglose pedidos */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">Desglose de Pedidos</h2>
            <Link to="/admin/pedidos" className="text-[10px] font-mono font-bold text-[#1E3859] hover:underline">Ver todos →</Link>
          </div>
          <div className="p-4 space-y-2">
            {cargando ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-xl" />
              ))
            ) : (
              Object.entries(ESTADO_META).map(([estado, m]) => (
                <div key={estado} className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${m.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${m.color}`}>{m.label}</span>
                  </div>
                  <span className={`font-mono font-black text-lg ${m.color}`}>{resumenPedidos[estado] ?? 0}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">⚠ Alertas de Stock</h2>
            <Link to="/admin/inventario" className="text-[10px] font-mono font-bold text-[#1E3859] hover:underline">Ir a Kardex →</Link>
          </div>
          <div className="p-4 space-y-2 max-h-[340px] overflow-y-auto">
            {stockBajo.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-mono text-xs">Todo el stock está en niveles normales.</p>
              </div>
            ) : (
              stockBajo.map((p) => {
                const stock = p.stockTotal ?? p.stock ?? 0;
                const agotado = stock === 0;
                return (
                  <div key={p.sku} className={`flex items-center justify-between border rounded-2xl px-4 py-2.5 ${
                    agotado ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="overflow-hidden">
                      <span className={`font-mono text-[10px] font-bold block ${agotado ? 'text-rose-500' : 'text-amber-600'}`}>
                        {p.sku}
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate block">{p.nombre}</span>
                    </div>
                    <div className="shrink-0 text-right ml-4">
                      <span className={`font-mono font-black text-lg ${agotado ? 'text-rose-600' : 'text-amber-600'}`}>
                        {stock}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block">uds.</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}