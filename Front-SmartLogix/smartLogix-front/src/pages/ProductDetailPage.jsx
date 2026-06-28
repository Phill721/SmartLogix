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
    
    // NUEVO: ESTADO PARA GUARDAR LA VERDAD DE LA BODEGA
    const [dataMaestra, setDataMaestra] = useState(null);
    const [consultandoBFF, setConsultandoBFF] = useState(true);

    // 1. LLAMAMOS AL ENDPOINT MAESTRO DEL BFF (Junta MySQL Productos + MySQL Bodega)
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
                    setDataMaestra(json); // Trae { producto: {...}, inventario: {...} }
                }
            } catch (e) {
                console.error("Fallo al unir microservicios:", e);
            } finally {
                setConsultandoBFF(false);
            }
        };

        obtenerVerdadLogistica();
    }, [sku]);

    // Respaldo por si el fetch falla rápido: usamos lo que haya en RAM
    const p = dataMaestra?.producto || (getProductBySku && getProductBySku(sku));
    
    // 🎯 AQUÍ NACE LA VERDAD FÍSICA: Extraemos el número real de la base de datos de Inventario
    const stockReal = dataMaestra?.inventario?.stockTotal !== undefined 
        ? dataMaestra.inventario.stockTotal 
        : (p?.stock || 0);

    if (consultandoBFF) {
        return <div className="p-20 text-center font-bold text-slate-500 animate-pulse font-mono">Cruzando datos con Kardex Central...</div>;
    }

    if (!p) return <div className="p-20 text-center font-bold text-slate-500">Producto no encontrado</div>;

    const isOutOfStock = stockReal <= 0;

    const titulo = p.nombre || p.name;
    const precio = p.precio !== undefined ? p.precio : (p.price || 0);
    const imagenPrincipal = p.imagenes?.[imagenActiva] || p.image;

    // AL HACER CLIC EN COMPRAR, LE EMPUJAMOS AL CARRITO EL OBJETO CON EL STOCK REAL INYECTADO
    const dispararAlCarrito = () => {
        const productoConRealidad = {
            ...p,
            stock: stockReal // <-- ¡El carrito ahora sabrá exactamente cuál es el techo!
        };
        addProduct(productoConRealidad);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 select-none">
            
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
                        <img src={imagenPrincipal} alt={titulo} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                    </div>

                    {p.imagenes && p.imagenes.length > 1 && (
                        <div className="flex gap-3 justify-center w-full overflow-x-auto pb-2">
                            {p.imagenes.map((imgUrl, idx) => (
                                <button
                                    key={idx} onClick={() => setImagenActiva(idx)}
                                    className={`w-16 h-16 rounded-xl border-2 bg-white p-1 flex items-center justify-center cursor-pointer ${
                                        imagenActiva === idx ? 'border-[#1E3859] scale-105 shadow-md ring-2 ring-[#1E3859]/20' : 'border-slate-200 opacity-60'
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
                            <span style={{ backgroundColor: theme.accent, color: theme.primary }} className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                {p.categoria || p.category}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{titulo}</h1>

                        <div className="text-4xl md:text-5xl font-black text-[#1E3859] mb-6">
                            ${precio.toLocaleString('es-CL')}
                        </div>

                        <hr className="border-slate-200 my-6" />

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción</h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                {p.descripcion || 'Sin descripción disponible.'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-auto">
                        <div className="mb-4">
                            {isOutOfStock ? (
                                <span className="text-red-600 font-bold text-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    Agotado en Kardex
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    Stock Real Bodega ({stockReal} unidades)
                                </span>
                            )}
                        </div>

                        <button
                            disabled={isOutOfStock}
                            onClick={dispararAlCarrito} 
                            style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : theme.primary }}
                            className="w-full text-white py-4 rounded-full border-2 border-black font-extrabold text-lg shadow-lg hover:opacity-95 transition-all active:scale-[0.99] disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isOutOfStock ? 'Sin stock físico' : 'Agregar al carrito'}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}