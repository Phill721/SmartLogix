import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProductContext } from '../context/ProductContext';
import { theme } from '../theme/colors';

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { actualizarStock } = useProductContext();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return <Navigate to="/" replace />;
  }

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: '',
    direccion: '',
    comuna: 'Concepción',
    region: 'Biobío',
    tipoDespacho: 'normal',
    metodoPago: 'webpay'
  });

  const [loading, setLoading] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const costoEnvio = formData.tipoDespacho === 'express' ? 4990 : 0;
  const totalFinal = cartTotal + costoEnvio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorPago('');

    await new Promise((res) => setTimeout(res, 1200));

    try {
      for (const item of cart) {
        await actualizarStock(item.sku, item.cantidad);
      }

      const nuevaOrden = {
        id: `SMLX-${Math.floor(100000 + Math.random() * 900000)}`,
        fecha: new Date().toLocaleDateString('es-CL'),
        cliente: formData,
        items: cart.map((item) => ({
          ...item,
          nombre: item.nombreProducto,
          quantity: item.cantidad,
          precio: item.precioUnitario,
        })),
        subtotal: cartTotal,
        envio: costoEnvio,
        total: totalFinal,
        metodo: formData.metodoPago,
      };

      clearCart();
      navigate('/exito', { state: { orden: nuevaOrden } });

    } catch (error) {
      setErrorPago(`Error al procesar la orden: ${error.message}. Intenta nuevamente.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/carrito" className="text-xs font-bold text-[#1E3859] hover:underline">
          ← Volver al carrito
        </Link>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider mt-2">
          Emisión de Despacho
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-xl space-y-8">

          {/* PASO 1 */}
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              1. Datos de quien recibe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text" required name="nombre" value={formData.nombre} onChange={handleChange}
                  placeholder="Ej: Matías Astudillo"
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo de seguimiento *</label>
                <input
                  type="email" required name="email" value={formData.email} onChange={handleChange}
                  placeholder="usuario@empresa.cl"
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono móvil (Para el chofer) *</label>
                <input
                  type="tel" required name="telefono" value={formData.telefono} onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* PASO 2 */}
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              2. Coordenadas de entrega
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección exacta (Calle y número) *</label>
                <input
                  type="text" required name="direccion" value={formData.direccion} onChange={handleChange}
                  placeholder="Av. Prat 450, Piso 3, Oficina 302"
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comuna *</label>
                <input
                  type="text" required name="comuna" value={formData.comuna} onChange={handleChange}
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Región *</label>
                <input
                  type="text" required name="region" value={formData.region} onChange={handleChange}
                  className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
              <label className={`flex-1 border-2 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all ${formData.tipoDespacho === 'normal' ? 'border-black bg-slate-50 font-bold' : 'border-slate-200 opacity-60'}`}>
                <input type="radio" name="tipoDespacho" value="normal" checked={formData.tipoDespacho === 'normal'} onChange={handleChange} className="accent-[#1E3859]" />
                <div className="text-xs"><p className="text-slate-900 font-black">Despacho Logístico Estándar</p><span className="text-emerald-700 font-bold">Gratis</span> (2 a 4 días)</div>
              </label>
              <label className={`flex-1 border-2 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all ${formData.tipoDespacho === 'express' ? 'border-black bg-slate-50 font-bold' : 'border-slate-200 opacity-60'}`}>
                <input type="radio" name="tipoDespacho" value="express" checked={formData.tipoDespacho === 'express'} onChange={handleChange} className="accent-[#1E3859]" />
                <div className="text-xs"><p className="text-slate-900 font-black">Prioridad Express</p><span className="text-red-600 font-bold">+$4.990</span> (Mismo día)</div>
              </label>
            </div>
          </div>

          {/* PASO 3 */}
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              3. Pasarela de Pago
            </h2>
            <div className="space-y-3">
              <label className={`w-full border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${formData.metodoPago === 'webpay' ? 'border-[#1E3859] bg-[#1E3859]/5 ring-2 ring-[#1E3859]/20 font-bold' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="metodoPago" value="webpay" checked={formData.metodoPago === 'webpay'} onChange={handleChange} className="accent-[#1E3859]" />
                  <span className="text-xs font-black text-slate-900">Webpay Plus (Tarjetas de Crédito / Débito)</span>
                </div>
                <span className="text-lg"></span>
              </label>
              <label className={`w-full border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${formData.metodoPago === 'transferencia' ? 'border-[#1E3859] bg-[#1E3859]/5 ring-2 ring-[#1E3859]/20 font-bold' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="metodoPago" value="transferencia" checked={formData.metodoPago === 'transferencia'} onChange={handleChange} className="accent-[#1E3859]" />
                  <span className="text-xs font-black text-slate-900">Transferencia Bancaria (Khipu / Manual)</span>
                </div>
                <span className="text-lg"></span>
              </label>
              {isAuthenticated && (
                <label className={`w-full border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${formData.metodoPago === 'credito_30' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/20 font-bold' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="metodoPago" value="credito_30" checked={formData.metodoPago === 'credito_30'} onChange={handleChange} className="accent-amber-600" />
                    <div>
                      <span className="text-xs font-black text-amber-950 block">Orden de Compra a 30 Días</span>
                      <span className="text-[10px] text-amber-800 font-mono">Exclusivo Operadores B2B SmartLogix</span>
                    </div>
                  </div>
                  <span className="text-lg"></span>
                </label>
              )}
            </div>
          </div>

          {errorPago && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-4 rounded-2xl">
              ❌ {errorPago}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-3xl p-6 shadow-xl sticky top-20 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b-2 border-black">
              Resumen de la Orden ({cartCount})
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-6 divide-y divide-slate-100">
              {cart.map((item) => {
                const precio = item.precioUnitario ?? 0;
                return (
                  <div key={item.sku} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                      <span className="font-mono font-bold bg-[#EBEFF2] px-1.5 py-0.5 rounded text-[10px]">x{item.cantidad}</span>
                      <span className="font-bold text-slate-800 truncate">{item.nombreProducto}</span>
                    </div>
                    <span className="font-black font-mono text-[#1E3859] shrink-0">${(precio * item.cantidad).toLocaleString('es-CL')}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
              <div className="flex justify-between"><span>Subtotal ítems</span><span className="font-bold text-slate-900">${cartTotal.toLocaleString('es-CL')}</span></div>
              <div className="flex justify-between items-center">
                <span>Logística y Despacho</span>
                <span className="font-bold font-mono text-slate-900">{costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio.toLocaleString('es-CL')}`}</span>
              </div>
            </div>

            <hr className="border-black/20 my-4" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm font-black text-slate-900 uppercase">Total a Pagar</span>
              <span className="text-3xl font-black text-[#1E3859]">${totalFinal.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: theme.primary }}
            className="w-full text-white py-4 rounded-full border-2 border-black font-extrabold text-base shadow-lg hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Procesando pago seguro...</span>
              </>
            ) : (
              <span>Confirmar y Pagar Orden</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}