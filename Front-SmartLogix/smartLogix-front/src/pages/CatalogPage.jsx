import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/catalog/ProductCard';

export default function CatalogPage() {
  const { categoryName } = useParams();
  const { getProductsByCategory } = useProducts();
  const [orden, setOrden] = useState('destacados');

  const productos = getProductsByCategory(categoryName || 'tecnologia');

  // Ordenador matemático
  const productosOrdenados = [...productos].sort((a, b) => {
    const pA = a.precio !== undefined ? a.precio : (a.price || 0);
    const pB = b.precio !== undefined ? b.precio : (b.price || 0);
    if (orden === 'menor') return pA - pB;
    if (orden === 'mayor') return pB - pA;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      
      {/* =========================================================================
         ENCABEZADO REPARADO: 'flex-col sm:flex-row' apila los elementos en celular
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-black/10">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
            Catálogo de inventario
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-wider">
            {categoryName}
          </h1>
        </div>

        {/* Filtro de ordenamiento sin desborde horizontal */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
            Ordenar:
          </span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-extrabold shadow-sm outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="destacados">Destacados</option>
            <option value="menor">Menor Precio</option>
            <option value="mayor">Mayor Precio</option>
          </select>
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {productosOrdenados.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-bold">
          No se encontraron productos en la categoría "{categoryName}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosOrdenados.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

    </div>
  );
}