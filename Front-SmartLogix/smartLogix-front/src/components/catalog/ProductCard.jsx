import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addProduct } = useCart();

  const stock = product.stockTotal !== undefined ? product.stockTotal : (product.stock || 0);
  const isOutOfStock = stock <= 0;

  const titulo = product.nombre || product.name;
  const precio = product.precio !== undefined ? product.precio : (product.price || 0);
  const imagen = product.imagenes?.[0] || product.image;

  return (
    <div 
      onClick={() => navigate(`/producto/${product.sku}`)}
      className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col items-center drop-shadow-[0_15px_25px_rgba(30,56,89,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:drop-shadow-[0_22px_35px_rgba(30,56,89,0.22)] hover:border-slate-300 cursor-pointer group select-none relative h-full justify-between"
    >
      
      {/* Contenedor Superior de Imagen (Blanco limpio) */}
      <div className="w-full h-44 bg-slate-50/70 rounded-2xl mb-3 overflow-hidden border border-slate-100 flex items-center justify-center p-3 relative shrink-0">
        <img
          src={imagen}
          alt={titulo}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* Información Central */}
      <div className="w-full text-center flex flex-col flex-1 justify-between px-1 my-1">
        <div>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight block mb-1">
            SKU: {product.sku} <span className="text-slate-300">|</span> <span className={stock > 0 ? "text-emerald-600 font-bold" : "text-rose-500"}>STOCK: {stock}</span>
          </span>
          <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#1E3859] transition-colors">
            {titulo}
          </h3>
        </div>
        
        <span className="text-base font-black text-[#1E3859] font-mono mt-2.5 block">
          ${Number(precio).toLocaleString('es-CL')}
        </span>
      </div>

      {/* Botón Inferior Estilo Pill (Sin bordes negros de historieta) */}
      <button
        disabled={isOutOfStock}
        onClick={(e) => {
          e.stopPropagation();
          addProduct(product);
        }}
        style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : theme.primary }}
        className="w-full text-white py-2.5 rounded-full text-xs font-bold transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed mt-3 shrink-0 shadow-md shadow-[#1E3859]/15"
      >
        {isOutOfStock ? 'Sin existencias' : 'Agregar al carrito'}
      </button>

    </div>
  );
}