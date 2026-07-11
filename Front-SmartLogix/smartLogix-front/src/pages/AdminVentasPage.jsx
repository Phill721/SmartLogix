import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProductContext } from '../context/ProductContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPeso = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0);

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const ESTADO_META = {
  PENDIENTE:   { color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',   dot: 'bg-amber-400',   label: 'Pendiente'   },
  CONFIRMADO:  { color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-200',     dot: 'bg-blue-400',    label: 'Confirmado'  },
  EN_PROCESO:  { color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200',   dot: 'bg-violet-400',  label: 'En Proceso'  },
  ENVIADO:     { color: 'text-cyan-600',    bg: 'bg-cyan-50    border-cyan-200',     dot: 'bg-cyan-400',    label: 'Enviado'     },
  ENTREGADO:   { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',  dot: 'bg-emerald-400', label: 'Entregado'   },
  CANCELADO:   { color: 'text-rose-600',    bg: 'bg-rose-50    border-rose-200',     dot: 'bg-rose-400',    label: 'Cancelado'   },
};

const meta = (estado) =>
  ESTADO_META[estado] ?? { color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', label: estado };

// ─── Componente KPI ───────────────────────────────────────────────────────────

function KpiCard({ label, valor, sub, acento, cargando }) {
  return (
    <div className={`p-6 rounded-3xl border drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] ${
      acento ? 'bg-[#1E3859] border-slate-700/40 text-white' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <span className={`text-[10px] font-mono uppercase tracking-widest block mb-3 ${acento ? 'text-slate-400' : 'text-slate-400'}`}>
        {label}
      </span>
      {cargando ? (
        <div className={`h-10 rounded-xl animate-pulse ${acento ? 'bg-white/10' : 'bg-slate-100'}`} />
      ) : (
        <span className={`text-3xl font-black font-mono block ${acento ? 'text-amber-300' : 'text-[#1E3859]'}`}>
          {valor}
        </span>
      )}
      {sub && (
        <span className={`text-[10px] font-mono block mt-1 ${acento ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</span>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminVentasPage() {
  const { token, user } = useAuth();
  const { products } = useProductContext();

  const [pedidos, setPedidos]     = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');
  const [pagina, setPagina]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Cargar todos los pedidos (admin) ────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
        const res = await fetch(`/api/bff/pedidos/pedidos/admin/todos?page=${pagina}&size=50`, {
          headers: { Authorization: authHeader },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPedidos(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token, pagina]);

  // ── Métricas calculadas ─────────────────────────────────────────────────────
  const entregados  = pedidos.filter((p) => p.estado === 'ENTREGADO');
  const cancelados  = pedidos.filter((p) => p.estado === 'CANCELADO');
  const activos     = pedidos.filter((p) => ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO'].includes(p.estado));

  const ingresoTotal  = entregados.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const ingresoActivo = activos.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const ticketPromedio = entregados.length > 0 ? ingresoTotal / entregados.length : 0;
  const tasaCancelacion = pedidos.length > 0 ? ((cancelados.length / pedidos.length) * 100).toFixed(1) : '0.0';

  const countPor = (estado) => pedidos.filter((p) => p.estado === estado).length;

  // Top 5 pedidos por monto
  const topPedidos = [...pedidos]
    .filter((p) => p.estado !== 'CANCELADO')
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 5);

  // Alertas de stock
  const stockBajo = products.filter((p) => (p.stockTotal ?? p.stock ?? 0) <= 5);
  const sinStock  = products.filter((p) => (p.stockTotal ?? p.stock ?? 0) === 0);

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
        <div className="bg-[#1E3859] border border-[#1E3859] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase">📊 Ventas</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <Link to="/admin/pedidos" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">🚚 Pedidos Globales</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-4 rounded-2xl mb-6">
          ❌ {error}
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Ingresos Confirmados"
          valor={formatPeso(ingresoTotal)}
          sub={`${entregados.length} pedidos entregados`}
          acento
          cargando={cargando}
        />
        <KpiCard
          label="Ingresos en Tránsito"
          valor={formatPeso(ingresoActivo)}
          sub={`${activos.length} pedidos activos`}
          cargando={cargando}
        />
        <KpiCard
          label="Ticket Promedio"
          valor={formatPeso(ticketPromedio)}
          sub="por pedido entregado"
          cargando={cargando}
        />
        <KpiCard
          label="Tasa Cancelación"
          valor={`${tasaCancelacion}%`}
          sub={`${cancelados.length} de ${pedidos.length} pedidos`}
          cargando={cargando}
        />
      </div>

      {/* ── Desglose + Top pedidos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Desglose por estado */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">Desglose por Estado</h2>
            <span className="text-[10px] font-mono text-slate-400">{pedidos.length} pedidos totales</span>
          </div>
          <div className="p-4 space-y-2">
            {cargando ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-xl" />
              ))
            ) : (
              Object.entries(ESTADO_META).map(([estado, m]) => {
                const count = countPor(estado);
                const pct = pedidos.length > 0 ? (count / pedidos.length) * 100 : 0;
                return (
                  <div key={estado} className={`border rounded-2xl px-4 py-2.5 ${m.bg}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${m.color}`}>{m.label}</span>
                      </div>
                      <span className={`font-mono font-black text-base ${m.color}`}>{count}</span>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${m.dot} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top pedidos por monto */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">Top Pedidos por Monto</h2>
            <Link to="/admin/pedidos" className="text-[10px] font-mono font-bold text-[#1E3859] hover:underline">Ver todos →</Link>
          </div>
          <div className="p-4 space-y-2">
            {cargando ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 animate-pulse rounded-xl" />
              ))
            ) : topPedidos.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="font-mono text-xs">Sin pedidos registrados aún.</p>
              </div>
            ) : (
              topPedidos.map((p, i) => {
                const m = meta(p.estado);
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                    <span className="font-mono font-black text-slate-300 text-lg w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-black text-slate-800 text-sm block">#{p.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">{formatFecha(p.fechaCreacion)}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono font-black text-[#1E3859] text-sm block">{formatPeso(p.total)}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase ${m.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                        {m.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Últimos pedidos + Alertas stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Últimos 10 pedidos */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">Últimos Pedidos</h2>
            <div className="flex gap-2">
              <button
                disabled={pagina === 0}
                onClick={() => setPagina((p) => p - 1)}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >←</button>
              <span className="text-[10px] font-mono text-slate-400 px-1 leading-6">{pagina + 1}/{totalPages}</span>
              <button
                disabled={pagina + 1 >= totalPages}
                onClick={() => setPagina((p) => p + 1)}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >→</button>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {cargando ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex gap-4">
                  <div className="flex-1 h-8 bg-slate-50 animate-pulse rounded-xl" />
                </div>
              ))
            ) : pedidos.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="font-mono text-xs">Sin pedidos registrados aún.</p>
              </div>
            ) : (
              pedidos.map((p) => {
                const m = meta(p.estado);
                return (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition-all">
                    <div className="shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">ID</span>
                      <span className="font-mono font-black text-slate-800 text-xs">#{p.id}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 border text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${m.bg} ${m.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                      {m.label}
                    </div>
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <span className="font-mono text-[10px] text-slate-400 truncate block">{formatFecha(p.fechaCreacion)}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono font-black text-slate-900 text-xs">{formatPeso(p.total)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">⚠ Alertas de Stock</h2>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {sinStock.length} agotados · {stockBajo.length - sinStock.length} stock bajo
              </p>
            </div>
            <Link to="/admin/inventario" className="text-[10px] font-mono font-bold text-[#1E3859] hover:underline">Ir a Kardex →</Link>
          </div>
          <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
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