import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/catalog/ProductCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { getProductsByCategory } = useProducts();

  // TÉCNICA DEFENSIVA: Aspiramos las 4 categorías que declaraste en tu Navbar
  const todosLosProductos = [
    ...(getProductsByCategory('tecnologia') || []),
    ...(getProductsByCategory('hardware') || []),
    ...(getProductsByCategory('perifericos') || []),
    ...(getProductsByCategory('electrodomesticos') || []),
  ];

  // Algoritmo de coincidencia profunda
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 border-b-2 border-black pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
            Resultados del motor
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wider">
            Búsqueda: "{query}"
          </h1>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          {resultados.length}{' '}
          {resultados.length === 1 ? 'ítem encontrado' : 'ítems encontrados'}
        </span>
      </div>

      {/* VISTA A: SIN RESULTADOS */}
      {resultados.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-black rounded-3xl shadow-md max-w-md mx-auto p-8">
          <span className="text-5xl block mb-3">🔍👀</span>
          <h3 className="text-lg font-black text-slate-900 mb-1">
            No hay coincidencias
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            SmartLogix no registra ningún componente, SKU o descripción asociada al término{' '}
            <strong className="text-slate-800">"{query}"</strong>.
          </p>
          <Link
            to="/"
            className="bg-[#1E3859] text-white text-xs font-black px-6 py-3 rounded-full border border-black shadow-sm hover:opacity-95 transition-opacity inline-block"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        /* VISTA B: GRILLA DE COINCIDENCIAS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resultados.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}