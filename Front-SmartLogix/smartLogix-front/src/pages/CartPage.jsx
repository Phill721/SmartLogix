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
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4 select-none">
        <img
          src="/public/gato.gif"
          alt="Carrito vacío"
          className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300"
        />
        <h2 className="text-2xl font-black text-slate-950 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-500 text-sm mb-8 font-mono">
          No registras órdenes ni productos listos para despacho en el módulo de SmartLogix.
        </p>
        <Link
          to="/"
          style={{ backgroundColor: theme.primary }}
          className="text-white px-8 py-3 rounded-full font-bold text-sm border-2 border-black shadow-md inline-block hover:opacity-95 cursor-pointer"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 select-none">
      <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-wider">
        Orden de Logística ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">

        <div className="bg-white border-2 border-black rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
          {cart.map((item) => {
            // 🛡️ Buscamos el producto en el contexto actualizado por el BFF
            const dataMySQL = (getProductBySku && getProductBySku(item.sku)) || {};

            const titulo = dataMySQL.nombre || item.nombreProducto || "Producto sin nombre";
            const precio = dataMySQL.precio !== undefined ? dataMySQL.precio : (item.precioUnitario || 0);
            const imagen = dataMySQL.imagenes?.[0] || item.imagenUrl || "/public/gato.gif";
            
            // 🚀 LÍMITE REAL: Usamos stockTotal del DTO que configuramos en el BFF
            const stockMaximo = dataMySQL.stockTotal !== undefined ? dataMySQL.stockTotal : 0;

            return (
              <div key={item.sku} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                <div
                  onClick={() => navigate(`/producto/${item.sku}`)}
                  className="w-20 h-20 bg-[#EBEFF2] border-2 border-black rounded-xl p-1.5 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <img src={imagen} alt={titulo} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 truncate">{titulo}</h3>
                  <span className="text-[11px] font-mono text-slate-400 block">SKU: {item.sku}</span>
                  <span className="text-sm font-mono font-black text-[#1E3859]">
                    ${Number(precio).toLocaleString('es-CL')}
                  </span>
                </div>

                {/* CONTADOR BLINDADO CONTRA STOCK MÁXIMO */}
                <div className="flex items-center border-2 border-black rounded-full bg-[#EBEFF2] overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() => updateQuantity(item.sku, -1)}
                    className="px-3 py-1 font-black text-slate-700 hover:bg-slate-300 cursor-pointer"
                  >-</button>
                  <span className="px-2 font-mono text-xs font-black text-slate-900 min-w-[24px] text-center">
                    {item.cantidad}
                  </span>
                  <button
                    disabled={item.cantidad >= stockMaximo}
                    onClick={() => updateQuantity(item.sku, 1)}
                    className="px-3 py-1 font-black text-slate-700 hover:bg-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    title={item.cantidad >= stockMaximo ? "Stock máximo alcanzado" : "Sumar"}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeProduct(item.sku)}
                  className="text-slate-400 hover:text-red-600 p-2 cursor-pointer"
                >🗑️</button>
              </div>
            );
          })}

          <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-end">
            <button
              onClick={clearCart}
              className="px-4 py-2 bg-rose-50 text-rose-700 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Vaciar Orden
            </button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-black">Resumen</h2>
          <div className="flex justify-between mb-6 font-mono font-bold">
            <span>Total:</span>
            <span className="text-2xl text-[#1E3859]">${cartTotal.toLocaleString('es-CL')}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')} 
            style={{ backgroundColor: theme.primary }}
            className="w-full text-white py-4 rounded-xl border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Emitir Orden gRPC →
          </button>
        </div>
      </div>
    </div>
  );
}