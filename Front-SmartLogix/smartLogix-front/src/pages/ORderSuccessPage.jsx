import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { theme } from '../theme/colors';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orden = location.state?.orden;

  // Si alguien intenta entrar a /exito escribiéndolo en Google sin haber pagado, lo echamos
  if (!orden) {
    return <Navigate to="/" replace />;
  }

  const { id, fecha, cliente, items, subtotal, envio, total, metodo } = orden;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border-2 border-black rounded-3xl shadow-2xl overflow-hidden">
        
        {/* CABECERA VERDE TRIUNFAL */}
        <div className="bg-emerald-600 text-white p-8 text-center relative">
          <div className="w-16 h-16 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-black shadow-inner">
            ✓
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest block opacity-80">Transacción verificada • NODO SSL</span>
          <h1 className="text-3xl font-black tracking-wide mt-1">¡Orden de Despacho Confirmada!</h1>
          <p className="text-xs text-emerald-100 mt-2 max-w-md mx-auto">
            Hemos derivado tu solicitud al centro de distribución. Recibirás las actualizaciones de ruta en <span className="underline font-bold">{cliente.email}</span>
          </p>
        </div>

        {/* CUERPO DE LA BOLETA */}
        <div className="p-8 md:p-12 space-y-8">
          
          {/* Tarjeta gris de metadatos */}
          <div className="bg-[#EBEFF2]/60 border-2 border-black/10 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase">Código de Seguimiento</span>
              <span className="text-lg font-black font-mono text-[#1E3859]">{id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase">Fecha Emisión</span>
              <span className="font-bold text-slate-800">{fecha}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase">Modalidad</span>
              <span className="font-bold text-slate-800 capitalize">{metodo.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase">Estado Flota</span>
              <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">En Preparación</span>
            </div>
          </div>

          {/* Destino */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Dirección de Despacho</h3>
            <p className="text-sm font-bold text-slate-900 capitalize">{cliente.direccion}, {cliente.comuna}, Región del {cliente.region}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">Receptor autorizado: {cliente.nombre} ({cliente.telefono})</p>
          </div>

          {/* Productos comprados */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Artículos Liberados del Stock</h3>
            <div className="space-y-3 divide-y divide-slate-100">
              {items.map((prod) => {
                const precio = prod.precio !== undefined ? prod.precio : (prod.price || 0);
                return (
                  <div key={prod.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#EBEFF2] rounded flex items-center justify-center font-mono text-[11px]">
                        {prod.quantity}
                      </span>
                      <span className="text-slate-800">{prod.nombre || prod.name}</span>
                    </div>
                    <span className="font-mono text-slate-900">${(precio * prod.quantity).toLocaleString('es-CL')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totales finales */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal logístico</span><span className="font-mono">${subtotal.toLocaleString('es-CL')}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tarifa de transporte</span><span className="font-mono">{envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-CL')}`}</span></div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL PAGADO</span>
              <span className="text-base font-mono text-[#1E3859]">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* BOTONERA DE SALIDA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border-2 border-black py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
            Guardar Comprobante (PDF)
            </button>
            
            <Link
              to="/"
              style={{ backgroundColor: theme.primary }}
              className="flex-1 text-white text-center py-3.5 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all cursor-pointer block"
            >
              Volver al Catálogo 
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}