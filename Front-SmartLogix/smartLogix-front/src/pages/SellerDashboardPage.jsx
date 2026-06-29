import React from 'react';
import { Link } from 'react-router-dom';

export default function SellerDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans select-none">
      
      {/* Banner Superior con profundidad */}
      <div className="bg-[#1E3859] text-white p-8 rounded-3xl shadow-xl mb-8 border border-slate-700/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-bold">Panel Logístico</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Gestión de Vendedor</h1>
        </div>
        <Link 
          to="/admin/inventario" 
          className="bg-white hover:bg-slate-50 text-[#1E3859] font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>📦</span>
          <span>Ajustar Kardex de Stock</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl shadow-slate-200/40 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Bodega Activa</span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Pedidos por Despachar</h2>
          </div>
          <div className="flex items-baseline gap-2 mt-6">
            <span className="text-5xl font-black text-[#1E3859] font-mono">0</span>
            <span className="text-xs font-bold text-slate-400">órdenes en cola</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl shadow-slate-200/40 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Existencias</span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Módulo de Productos</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
              Puedes supervisar el inventario activo e ingresar mermas o abastecimiento directamente en la base central.
            </p>
          </div>
          <div className="mt-6">
            <Link to="/admin/inventario" className="text-xs font-bold text-[#1E3859] hover:underline inline-flex items-center gap-1 font-mono">
              Revisar catálogo completo →
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}