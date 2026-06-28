import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const isOutOfStock = product.stock === 0;

  const titulo = product.nombre || product.name;
  const precio = product.precio !== undefined ? product.precio : (product.price || 0);
  const imagen = product.imagenes?.[0] || product.image;

  return (
    <div 
      onClick={() => navigate(`/producto/${product.sku}`)}
      className="border-2 border-black rounded-2xl p-4 flex flex-col items-center bg-[#EBEFF2] aspect-square relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
    >
      <div className="w-full flex-1 min-h-0 bg-white rounded-2xl mb-3 overflow-hidden border border-slate-200 flex items-center justify-center p-2">
        <img
          src={imagen}
          alt={titulo}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="w-full text-center flex flex-col justify-end">
        <span className="text-xs text-slate-500 font-mono mb-1">SKU: {product.sku}</span>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#1E3859] transition-colors">
          {titulo}
        </h3>
        <span className="text-lg font-bold text-slate-900 mb-3">
          ${precio.toLocaleString('es-CL')}
        </span>
      </div>

      <button
        disabled={isOutOfStock}
        onClick={(e) => {
          e.stopPropagation();
          addProduct(product);
        }}
        style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : theme.primary }}
        className="w-[85%] text-white py-1.5 rounded-full border border-black text-sm font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed mt-auto shrink-0 z-10 cursor-pointer"
      >
        {isOutOfStock ? 'Sin Stock' : 'Agregar al carrito'}
      </button>
    </div>
  );
}