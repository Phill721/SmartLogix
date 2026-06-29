import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/catalog/ProductCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { getProductsByCategory } = useProducts();

  const todosLosProductos = [
    ...(getProductsByCategory('tecnologia') || []),
    ...(getProductsByCategory('hardware') || []),
    ...(getProductsByCategory('perifericos') || []),
    ...(getProductsByCategory('electrodomesticos') || []),
  ];

  const resultados = todosLosProductos.filter((p) => {
    if (!query) return false;
    const q = query.toLowerCase().trim();

    const coincideNombre = (p.nombre || p.name || '').toLowerCase().includes(q);
    const coincideDesc = (p.descripcion || p.description || '').toLowerCase().includes(q);
    const coincideSku = (p.sku || '').toLowerCase().includes(q);
    const coincideCat = (p.categoria || p.category || '').toLowerCase().includes(q);

    return coincideNombre || coincideDesc || coincideSku || coincideCat;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans select-none animate-fade-in">
      
      {/* Encabezado Elevado */}
      <div className="mb-10 border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#1E3859] uppercase tracking-widest bg-[#1E3859]/10 px-3 py-1 rounded-full">
            Motor de indexación
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2.5">
            Búsqueda: "{query}"
          </h1>
        </div>
        
        <span className="text-xs font-mono font-bold text-slate-400 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm self-start sm:self-auto">
          {resultados.length} {resultados.length === 1 ? 'coincidencia' : 'coincidencias'}
        </span>
      </div>

      {/* VISTA A: SIN RESULTADOS (Levitando con sombra hacia el fondo) */}
      {resultados.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl drop-shadow-[0_20px_35px_rgba(30,56,89,0.12)] max-w-md mx-auto p-8 my-8">
          <span className="text-5xl block mb-3 opacity-80">🔍</span>
          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">
            Sin coincidencias en base
          </h3>
          <p className="text-xs text-slate-400 mb-8 leading-relaxed font-normal">
            SmartLogix no registra componentes, SKUs transaccionales o manifiestos asociados al término{' '}
            <strong className="text-slate-700 font-mono">"{query}"</strong>.
          </p>
          <Link
            to="/"
            className="bg-[#1E3859] text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-md shadow-[#1E3859]/20 hover:opacity-95 transition-all inline-block uppercase tracking-wider"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        /* VISTA B: GRILLA REAL */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
          {resultados.map((prod) => (
            <ProductCard key={prod.sku || prod.id} product={prod} />
          ))}
        </div>
      )}

    </div>
  );
}