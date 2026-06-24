import React from 'react';
import { theme } from '../theme/colors';

export default function AdminDashboardPage() {
  // Datos simulados para las métricas de control de SmartLogix
  const kpis = [
    { id: 1, titulo: 'Órdenes en Tránsito', valor: '342', color: '#1E3859', icon: '🚚' },
    { id: 2, titulo: 'Alertas de Stock Crítico', valor: '4 productos', color: '#DC2626', icon: '⚠️' },
    { id: 3, titulo: 'Operadores Activos', valor: '18 nodos', color: '#42628C', icon: '💻' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header del Panel */}
      <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <span style={{ color: theme.secondary }} className="text-xs font-mono uppercase tracking-widest block mb-1">
            Módulo Central • HU-FE-ADM-01
          </span>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider">
            Consola de Administración General
          </h1>
        </div>
        <span className="text-xs font-mono bg-black text-white px-3 py-1 rounded-full">
          Rol: SuperAdmin
        </span>
      </div>

      {/* Grilla de KPIs / Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white border-2 border-black rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{kpi.titulo}</span>
              <span className="text-3xl font-black text-slate-900">{kpi.valor}</span>
            </div>
            <span className="text-3xl bg-[#EBEFF2] w-12 h-12 rounded-xl flex items-center justify-center border border-black/10">
              {kpi.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Sección Inferior: Control de Inventario Global */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4">
          Monitoreo de Nivel de Stock (Kafka Stream)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold">SKU Nodo</th>
                <th className="pb-3 font-bold">Componente</th>
                <th className="pb-3 font-bold">Stock Físico</th>
                <th className="pb-3 font-bold">Estado Logístico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-4 font-mono text-xs text-slate-400">PER-003</td>
                <td className="py-4 font-bold text-slate-900">Audífonos Cloth Corsair HS35</td>
                <td className="py-4">0 unidades</td>
                <td className="py-4">
                  <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                    Quiebre de Stock
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4 font-mono text-xs text-slate-400">PER-002</td>
                <td className="py-4 font-bold text-slate-900">Teclado Mecánico RGB Redragon K552</td>
                <td className="py-4">5 unidades</td>
                <td className="py-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-yellow-200">
                    Stock Mínimo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}