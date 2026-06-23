import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { theme } from '../theme/colors'; // Revisa si tu ruta es ../themes/color o ../theme/colors

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const idProducto = parseInt(id || '0');

    const { getProductById, loading, error } = useProducts(); 
    const { addProduct } = useCart();

    // Galería: controla qué foto del array se ve arriba
    const [imagenActiva, setImagenActiva] = useState(0);

    const p = getProductById ? getProductById(idProducto) : null;

    if (!p) return <div className="p-20 text-center font-bold text-slate-500">Producto no encontrado</div>;

    const isOutOfStock = p.stock === 0;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            
            {/* Botón Volver */}
            <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center space-x-2 text-sm font-bold text-[#1E3859] hover:underline mb-8 cursor-pointer"
            >
                <span>←</span>
                <span>Volver al listado</span>
            </button>

            {/* TARJETA PRINCIPAL: DIVIDIDA EN 2 COLUMNAS PURAS (50% / 50%) */}
            <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                
                {/* ================= COLUMNA 1: IMAGEN ================= */}
                <div className="flex flex-col items-center w-full">
                    
                    {/* Foto principal grande */}
                    <div className="bg-[#EBEFF2] rounded-2xl border-2 border-black p-8 flex items-center justify-center aspect-square w-full relative mb-4">
                        <img 
                            src={p.imagenes?.[imagenActiva] || p.imagenes?.[0]} 
                            alt={p.nombre} 
                            className="max-h-full max-w-full object-contain drop-shadow-xl transition-all duration-300"
                        />
                    </div>

                    {/* Tira de miniaturas abajo (Solo aparece si el producto tiene 2 o más fotos) */}
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

                {/* ================= COLUMNA 2: TEXTO "AL LADO" ================= */}
                <div className="flex flex-col justify-between h-full py-2">
                    
                    {/* Bloque superior de información */}
                    <div>
                        {/* Tag Categoria + SKU */}
                        <div className="flex items-center justify-between mb-3">
                            <span 
                                style={{ backgroundColor: theme.accent, color: theme.primary }}
                                className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
                            >
                                {p.categoria}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>

                        {/* Nombre del producto */}
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                            {p.nombre}
                        </h1>

                        {/* Precio */}
                        <div className="text-4xl md:text-5xl font-black text-[#1E3859] mb-6">
                            ${p.precio ? p.precio.toLocaleString('es-CL') : p.price?.toLocaleString('es-CL')}
                        </div>

                        <hr className="border-slate-200 my-6" />

                        {/* Descripción real de la base de datos Java */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Descripción
                            </h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                {p.descripcion || 'Sin descripción disponible para este producto.'}
                            </p>
                        </div>
                    </div>

                    {/* Bloque inferior: Stock y Botón (Siempre empujado hacia abajo) */}
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
                            onClick={() => addProduct(p)}
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