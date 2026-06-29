import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';
import { theme } from '../theme/colors';

export default function CartPage() {
  const { cart, removeProduct, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const { getProductBySku } = useProductContext();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4 select-none font-sans">
        <img
          src="/public/gato.gif"
          alt="Carrito vacío"
          className="max-w-44 max-h-44 object-contain opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-300 mb-2"
        />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tu carrito está vacío</h2>
        <p className="text-slate-400 text-xs mb-8 max-w-md font-sans">
          No registras órdenes transaccionales ni productos en cola de preparación para despacho regional.
        </p>
        <Link
          to="/"
          style={{ backgroundColor: theme.primary }}
          className="text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider drop-shadow-md hover:opacity-95 transition-all"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 select-none font-sans">
      
      <div className="pb-6 mb-8 border-b border-slate-200/80">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Manifiesto de Compra</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
          Orden de Logística ({cartCount})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">

        {/* CONTENEDOR FLOTANTE CON SOMBRA HACIA EL FONDO MUY NOTORIA */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 drop-shadow-[0_20px_35px_rgba(30,56,89,0.14)] space-y-4">
          {cart.map((item) => {
            const dataMySQL = (getProductBySku && getProductBySku(item.sku)) || {};
            const titulo = dataMySQL.nombre || item.nombreProducto || "Producto sin nombre";
            const precio = dataMySQL.precio !== undefined ? dataMySQL.precio : (item.precioUnitario || 0);
            const imagen = dataMySQL.imagenes?.[0] || item.imagenUrl || "/public/gato.gif";
            const stockMaximo = dataMySQL.stockTotal !== undefined ? dataMySQL.stockTotal : 0;

            return (
              <div key={item.sku} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                <div
                  onClick={() => navigate(`/producto/${item.sku}`)}
                  className="w-20 h-20 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                >
                  <img src={imagen} alt={titulo} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-800 truncate">{titulo}</h3>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">SKU: {item.sku}</span>
                  <span className="text-xs font-mono font-black text-[#1E3859] mt-1 block">
                    ${Number(precio).toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Pill Counter que aparece en image_5e9eff.png */}
                <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 overflow-hidden shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.sku, -1)}
                    className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer text-xs transition-colors"
                  >-</button>
                  <span className="px-2 font-mono text-xs font-bold text-slate-800 min-w-[24px] text-center">
                    {item.cantidad}
                  </span>
                  <button
                    disabled={item.cantidad >= stockMaximo}
                    onClick={() => updateQuantity(item.sku, 1)}
                    className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer text-xs transition-colors"
                    title={item.cantidad >= stockMaximo ? "Techo físico alcanzado" : "Añadir"}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeProduct(item.sku)}
                  className="text-slate-300 hover:text-rose-500 p-2 cursor-pointer transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={clearCart}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full font-bold text-[11px] transition-all cursor-pointer shadow-sm"
            >
              Vaciar Orden
            </button>
          </div>
        </div>

        {/* Tarjeta Resumen Flotante lateral */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 drop-shadow-[0_20px_35px_rgba(30,56,89,0.18)] sticky top-24">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">Resumen de Cuenta</h2>
          
          <div className="flex justify-between items-baseline mb-8 font-mono">
            <span className="text-xs font-bold text-slate-400">Total a pagar:</span>
            <span className="text-3xl font-black text-[#1E3859]">${cartTotal.toLocaleString('es-CL')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')} 
            style={{ backgroundColor: theme.primary }}
            className="w-full text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest drop-shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            Siguiente: Despacho →
          </button>
        </div>

      </div>
    </div>
  );
}