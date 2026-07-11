import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/catalog/ProductCard';

export default function CatalogPage() {
  const { categoryName } = useParams();
  const { products, getProductsByCategory } = useProductContext();
  const [orden, setOrden] = useState('destacados');
  const [productosConStock, setProductosConStock] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sincronizarCatalogo = async () => {
      setCargando(true);

      const base = getProductsByCategory(categoryName || 'tecnologia');

      if (base.length === 0 && products.length === 0) {
        setCargando(false);
        return;
      }

      const token = localStorage.getItem('smartlogix_token');
      
      const enriquecidos = await Promise.all(base.map(async (prod) => {
        try {
          const res = await fetch(`/api/bff/inventario/${prod.sku}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });

          if (!res.ok) {
            console.error(`❌ El servidor bloqueó la petición para ${prod.sku} (Código: ${res.status})`);
            return { ...prod, stockTotal: 0 };
          }

          const inv = await res.json();
          console.log(`📦 RESPUESTA KARDEX PARA [${prod.sku}]:`, inv);

          // 🕵️‍♂️ ALGORITMO TODOTERRENO: Busca el stock sin importar cómo lo envíe Java
          const stockReal = 
            inv?.stockTotal ?? 
            inv?.stock ?? 
            inv?.cantidad ?? 
            inv?.data?.stockTotal ?? 
            inv?.data?.stock ?? 
            0;

          return { ...prod, stockTotal: stockReal };

        } catch (e) {
          console.error(`🔥 Error de red al consultar kardex de ${prod.sku}:`, e);
          return { ...prod, stockTotal: 0 };
        }
      }));
      
      setProductosConStock(enriquecidos);
      setCargando(false);
    };

    sincronizarCatalogo();
  }, [categoryName, products]);

  const productosOrdenados = [...productosConStock].sort((a, b) => {
    const pA = a.precio !== undefined ? a.precio : (a.price || 0);
    const pB = b.precio !== undefined ? b.precio : (b.price || 0);
    if (orden === 'menor') return pA - pB;
    if (orden === 'mayor') return pB - pA;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans select-none animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#1E3859] uppercase tracking-widest bg-[#1E3859]/10 px-3 py-1 rounded-full">
            Catálogo de inventario
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tight mt-2.5">
            {categoryName || 'Tecnología'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap font-mono">
            Ordenar:
          </span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#1E3859] outline-none cursor-pointer pr-2"
          >
            <option value="destacados">Destacados</option>
            <option value="menor">Menor Precio</option>
            <option value="mayor">Mayor Precio</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-24 font-mono text-xs text-slate-400 animate-pulse">
          Sincronizando existencias con bodega...
        </div>
      ) : productosOrdenados.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-lg shadow-slate-100">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-xs text-slate-500 font-bold">No se encontraron productos en la categoría "{categoryName}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosOrdenados.map((prod) => (
            <ProductCard 
              key={`${prod.sku}-${prod.stockTotal}`} 
              product={prod} 
            />
          ))}
        </div>
      )}

    </div>
  );
}