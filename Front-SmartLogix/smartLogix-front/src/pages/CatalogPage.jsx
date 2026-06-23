import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/catalog/ProductCard';
import { useProducts } from '../hooks/useProducts'; // <-- 1. IMPORTAMOS EL HOOK

export default function CatalogPage() {
  const { categoryName } = useParams();
  const { getProductsByCategory } = useProducts(); // <-- 2. EXTRAEMOS LA FUNCIÓN

  const filteredProducts = getProductsByCategory(categoryName);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-10 px-4 md:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">
          {categoryName || 'Catálogo'}
        </h1>
        
        <div className="relative">
          <select className="bg-white border-2 border-slate-900 text-slate-900 px-5 py-2 pr-10 text-sm font-medium focus:outline-none rounded-full min-w-[240px] appearance-none cursor-pointer">
            <option value="">Ordenar por</option>
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8 px-4 md:px-8 pb-12">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-20 px-4 flex flex-col items-center">
            No hay productos en esta categoría.
        </div>
      )}
    </div>
  );
}