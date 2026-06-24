import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { theme } from '../theme/colors';

export default function CartPage() {
  const { cart, removeProduct, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <img
          src="/public/gato.gif"
          alt="Carrito vacío"
          className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300"
        />
        <h2 className="text-2xl font-black text-slate-950 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-500 text-sm mb-8">
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-wider">
        Orden de Logística ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">

        <div className="bg-white border-2 border-black rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
          {cart.map((item) => {
            const titulo = item.nombre || item.name;
            const precio = item.precio !== undefined ? item.precio : (item.price || 0);
            const imagen = item.imagenes?.[0] || item.image;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0"
              >
                <div
                  onClick={() => navigate(`/producto/${item.id}`)}
                  className="w-20 h-20 bg-[#EBEFF2] border-2 border-black rounded-xl p-1 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <img src={imagen} alt={titulo} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/producto/${item.id}`)}
                    className="text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-[#1E3859] transition-colors"
                  >
                    {titulo}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">SKU: {item.sku}</span>
                  <span className="text-sm font-black text-[#1E3859]">${precio.toLocaleString('es-CL')} c/u</span>
                </div>

                <div className="flex items-center border-2 border-black rounded-full bg-[#EBEFF2] overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="px-3 py-1 font-black text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-slate-900 min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="px-3 py-1 font-black text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeProduct(item.id)}
                  className="text-slate-400 hover:text-red-600 p-2 transition-colors cursor-pointer text-lg"
                  title="Eliminar producto"
                >
                  🗑️
                </button>
              </div>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Vaciar orden de compra
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b-2 border-black">
              Resumen Despacho
            </h2>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} unidades)</span>
                <span className="font-bold text-slate-900">${cartTotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Costo de envío</span>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Gratis
                </span>
              </div>
            </div>

            <hr className="border-slate-200 my-4" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-base font-bold text-slate-900">Total Neto</span>
              <span className="text-3xl font-black text-[#1E3859]">
                ${cartTotal.toLocaleString('es-CL')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')} 
            style={{ backgroundColor: theme.primary }}
            className="w-full text-white py-4 rounded-full border-2 border-black font-extrabold text-base shadow-md hover:opacity-95 transition-all active:scale-[0.99] cursor-pointer"
          >
            Continuar con el Despacho
          </button>
        </div>

      </div>
    </div>
  );
}