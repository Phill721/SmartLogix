import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchMisPedidos = async () => {
      const token = localStorage.getItem('smartlogix_token');
      try {
        const res = await fetch(`/api/bff/pedidos/cliente/${user?.email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrdenes(await res.json());
      } catch (e) {} 
      finally { setCargando(false); }
    };
    fetchMisPedidos();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans select-none">
      
      <div className="flex justify-between items-end pb-6 mb-8 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Área Personal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">Mis Pedidos</h1>
        </div>
        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-3.5 py-1 rounded-full border border-slate-200">
          Cliente: {user?.nombre?.split(' ')[0]}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 font-mono">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compras Realizadas</span>
          <span className="text-3xl font-black text-[#1E3859] mt-1 block">{ordenes.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cuenta Segura</span>
          <span className="text-xs font-bold text-slate-700 mt-1 truncate">{user?.email}</span>
        </div>
      </div>

      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">Historial de despachos</h3>
      
      {cargando ? (
        <div className="py-12 text-center font-mono text-xs text-slate-400">Consultando despachos...</div>
      ) : ordenes.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-lg shadow-slate-100">
          <span className="text-3xl block mb-2">📦</span>
          <p className="text-xs font-bold text-slate-500 font-sans">Aún no tienes compras en camino.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordenes.map((o, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl flex justify-between items-center shadow-md shadow-slate-200/30 hover:shadow-lg transition-all">
              <div>
                <span className="font-bold text-slate-900 text-xs font-mono block">ORDEN #{o.id || 99201 + idx}</span>
                <span className="text-slate-400 text-[11px] font-sans">Enviado mediante flota regional</span>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-3 py-1 rounded-full border border-emerald-200">
                {o.estado || 'En Preparación'}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}