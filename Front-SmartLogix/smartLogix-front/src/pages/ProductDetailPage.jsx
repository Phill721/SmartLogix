import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { theme } from '../theme/colors'; 

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const idProducto = parseInt(id || '0');

    const { getProductById } = useProducts(); 
    const { addProduct } = useCart(); // <-- AHORA DISPARA AL CONTEXTO GLOBAL

    const [imagenActiva, setImagenActiva] = useState(0);

    const p = getProductById ? getProductById(idProducto) : null;

    if (!p) return <div className="p-20 text-center font-bold text-slate-500">Producto no encontrado</div>;

    const isOutOfStock = p.stock === 0;

    const titulo = p.nombre || p.name;
    const precio = p.precio !== undefined ? p.precio : (p.price || 0);
    const imagenPrincipal = p.imagenes?.[imagenActiva] || p.image;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            
            <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center space-x-2 text-sm font-bold text-[#1E3859] hover:underline mb-8 cursor-pointer"
            >
                <span>←</span>
                <span>Volver al listado</span>
            </button>

            <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                
                {/* COLUMNA IMAGEN */}
                <div className="flex flex-col items-center w-full">
                    <div className="bg-[#EBEFF2] rounded-2xl border-2 border-black p-8 flex items-center justify-center aspect-square w-full relative mb-4">
                        <img 
                            src={imagenPrincipal} 
                            alt={titulo} 
                            className="max-h-full max-w-full object-contain drop-shadow-xl transition-all duration-300"
                        />
                    </div>

                    {p.imagenes && p.imagenes.length > 1 && (
                        <div className="flex gap-3 justify-center w-full overflow-x-auto pb-2">
                            {p.imagenes.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setImagenActiva(idx)}
                                    className={`w-16 h-16 rounded-xl border-2 bg-white p-1 flex items-center justify-center transition-all cursor-pointer ${
                                        imagenActiva === idx ? 'border-[#1E3859] scale-105 shadow-md ring-2 ring-[#1E3859]/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUMNA TEXTO */}
                <div className="flex flex-col justify-between h-full py-2">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span 
                                style={{ backgroundColor: theme.accent, color: theme.primary }}
                                className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
                            >
                                {p.categoria || p.category}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                            {titulo}
                        </h1>

                        <div className="text-4xl md:text-5xl font-black text-[#1E3859] mb-6">
                            ${precio.toLocaleString('es-CL')}
                        </div>

                        <hr className="border-slate-200 my-6" />

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Descripción
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                {p.descripcion || p.description || 'Sin descripción disponible.'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-auto">
                        <div className="mb-4">
                            {isOutOfStock ? (
                                <span className="text-red-600 font-bold text-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    Agotado temporalmente
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    Stock disponible ({p.stock} unidades)
                                </span>
                            )}
                        </div>

                        <button
                            disabled={isOutOfStock}
                            onClick={() => addProduct(p)} /* <-- DISPARO REAL */
                            style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : theme.primary }}
                            className="w-full text-white py-4 rounded-full border-2 border-black font-extrabold text-lg shadow-lg hover:opacity-95 transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                        >
                            {isOutOfStock ? 'No disponible' : 'Agregar al carrito'}
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}