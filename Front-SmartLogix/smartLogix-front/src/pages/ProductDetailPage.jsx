import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { theme } from '../theme/colors'; 

export default function ProductDetailPage() {
    const { sku } = useParams();
    const navigate = useNavigate();

    const { getProductBySku } = useProductContext(); 
    const { addProduct } = useCart(); 

    const [imagenActiva, setImagenActiva] = useState(0);
    const [dataMaestra, setDataMaestra] = useState(null);
    const [consultandoBFF, setConsultandoBFF] = useState(true);

    useEffect(() => {
        const obtenerVerdadLogistica = async () => {
            const token = localStorage.getItem('smartlogix_token');
            try {
                setConsultandoBFF(true);
                const res = await fetch(`/api/bff/productos/completo/${sku}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const json = await res.json();
                    setDataMaestra(json); 
                }
            } catch (e) {
                console.error("Fallo al unir microservicios:", e);
            } finally {
                setConsultandoBFF(false);
            }
        };

        obtenerVerdadLogistica();
    }, [sku]);

    const p = dataMaestra?.producto || (getProductBySku && getProductBySku(sku));
    
    const stockReal = dataMaestra?.inventario?.stockTotal !== undefined 
        ? dataMaestra.inventario.stockTotal 
        : (p?.stock || 0);

    if (consultandoBFF) {
        return <div className="py-32 text-center font-mono text-xs text-slate-400 animate-pulse">Cruzando datos con Kardex Central...</div>;
    }

    if (!p) return <div className="py-32 text-center font-bold text-slate-500 text-sm">Producto no encontrado en el catálogo</div>;

    const isOutOfStock = stockReal <= 0;
    const titulo = p.nombre || p.name;
    const precio = p.precio !== undefined ? p.precio : (p.price || 0);
    const imagenPrincipal = p.imagenes?.[imagenActiva] || p.image;

    const dispararAlCarrito = () => {
        const productoConRealidad = {
            ...p,
            stock: stockReal 
        };
        addProduct(productoConRealidad);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans select-none animate-fade-in">
            
            <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-[#1E3859] mb-6 cursor-pointer transition-colors bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
            >
                <span>←</span>
                <span>Volver al listado</span>
            </button>

            {/* Contenedor Principal Levitante */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 drop-shadow-[0_20px_35px_rgba(30,56,89,0.12)] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                
                {/* COLUMNA IMAGEN */}
                <div className="flex flex-col items-center w-full">
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-8 flex items-center justify-center aspect-square w-full relative mb-4 shadow-inner">
                        <img src={imagenPrincipal} alt={titulo} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>

                    {p.imagenes && p.imagenes.length > 1 && (
                        <div className="flex gap-3 justify-center w-full overflow-x-auto pb-2">
                            {p.imagenes.map((imgUrl, idx) => (
                                <button
                                    key={idx} onClick={() => setImagenActiva(idx)}
                                    className={`w-16 h-16 rounded-xl border bg-white p-1.5 flex items-center justify-center cursor-pointer transition-all ${
                                        imagenActiva === idx ? 'border-[#1E3859] scale-105 shadow-md ring-2 ring-[#1E3859]/10' : 'border-slate-200 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUMNA TEXTO */}
                <div className="flex flex-col justify-between h-full py-2">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-[#1E3859]/10 text-[#1E3859]">
                                {p.categoria || p.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-3 tracking-tight">{titulo}</h1>

                        <div className="text-3xl md:text-4xl font-black text-[#1E3859] mb-6 font-mono">
                            ${precio.toLocaleString('es-CL')}
                        </div>

                        <hr className="border-slate-100 my-6" />

                        <div className="mb-8">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Descripción</h3>
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line font-normal">
                                {p.descripcion || 'Sin descripción logística disponible en base.'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-auto">
                        <div className="mb-4">
                            {isOutOfStock ? (
                                <span className="text-rose-600 font-bold text-xs flex items-center gap-1.5 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                                    Agotado en Kardex Central
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Stock Bodega ({stockReal} disponibles)
                                </span>
                            )}
                        </div>

                        <button
                            disabled={isOutOfStock}
                            onClick={dispararAlCarrito} 
                            style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : theme.primary }}
                            className="w-full text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1E3859]/20 hover:opacity-95 transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                        >
                            {isOutOfStock ? 'Sin existencias físicas' : 'Agregar al carrito'}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}