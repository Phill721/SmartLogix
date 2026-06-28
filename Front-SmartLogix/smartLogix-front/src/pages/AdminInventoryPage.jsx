import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { theme } from '../theme/colors';

export default function AdminInventoryPage() {
  const { products, recargarCatalogo } = useProductContext();
  
  const [busqueda, setBusqueda] = useState('');
  const [skuActivo, setSkuActivo] = useState(null);
  const [nuevoStock, setNuevoStock] = useState(0);
  
  const [procesando, setProcesando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const seleccionarItem = async (prod) => {
    setFeedback(null);
    setSkuActivo(prod);
    const token = localStorage.getItem('smartlogix_token');
    
    try {
      const res = await fetch(`/api/bff/inventario/${prod.sku}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dataBodega = await res.json();
        setNuevoStock(dataBodega.stockTotal !== undefined ? dataBodega.stockTotal : (dataBodega.cantidad || 0));
      } else {
        setNuevoStock(0);
      }
    } catch (e) {
      setNuevoStock(0);
    }
  };

  // DISPARO AL MICROSERVICIO DE INVENTARIO (PUT /api/bff/inventario/{sku})
  const impactarKardex = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('smartlogix_token');
    setProcesando(true);
    setFeedback(null);

    try {
      const skuLimpio = skuActivo.sku.toUpperCase().trim();
      const cantidadNumerica = parseInt(nuevoStock, 10);
      
      // JSON MINIMALISTA: Solo los campos que AjusteRequest espera
      const dtoAjuste = {
        cantidad: cantidadNumerica,
        motivo: "Ajuste manual por consola de administrador"
      };

      const res = await fetch(`/api/bff/inventario/${skuLimpio}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dtoAjuste)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }

      setFeedback({ ok: true, msg: `✅ Kardex actualizado: [${skuLimpio}] fijado en ${cantidadNumerica} unidades.` });
      await recargarCatalogo(); 
    } catch (err) {
      setFeedback({ ok: false, msg: `⛔ Rechazo en Bodega: ${err.message}` });
    } finally {
      setProcesando(false);
    }
  };

  const listaFiltrada = products.filter(p => 
    (p.sku || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.nombre || p.name || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-4 border-black">
        <div>
          <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">
            Microservicio : Puerto 8083
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            Kardex Central de Bodega
          </h1>
        </div>

        <div className="w-full sm:w-72">
          <input 
            type="text"
            placeholder="🔍 Filtrar por SKU o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-xs font-mono font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-amber-50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 items-start">
        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-slate-900 text-white px-6 py-4 font-mono text-xs font-bold flex justify-between items-center border-b-2 border-black">
            <span>INVENTARIO GENERAL ({listaFiltrada.length} SKUs)</span>
            <span className="text-emerald-400">● Bodega Principal Activa</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 font-mono text-[11px] text-slate-500 uppercase sticky top-0 z-10">
                  <th className="py-3 px-4">Ítem</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Catálogo RAM</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-medium">
                {listaFiltrada.map((p) => {
                  const nombre = p.nombre || p.name || "Sin título";
                  const foto = p.imagenes?.[0] || p.image || "/public/gato.gif";
                  return (
                    <tr 
                      key={p.sku} 
                      onClick={() => seleccionarItem(p)}
                      className={`cursor-pointer transition-colors ${skuActivo?.sku === p.sku ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={foto} alt="" className="w-9 h-9 rounded-lg border border-black object-contain bg-slate-100 p-0.5 shrink-0" />
                        <span className="truncate max-w-[180px] text-slate-900">{nombre}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{p.sku}</td>
                      <td className="py-3 px-4 text-center font-mono font-black text-xs text-slate-400">[ Ver en Kardex ]</td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] uppercase text-amber-700 font-bold">👈 Inspeccionar</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sticky top-6">
          {!skuActivo ? (
            <div className="bg-slate-100 border-2 border-dashed border-black rounded-3xl p-8 text-center text-slate-400 font-mono">
              <span className="text-4xl block mb-2">👈</span>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-600">Selecciona un SKU para abrir su controlador.</p>
            </div>
          ) : (
            <form onSubmit={impactarKardex} className="bg-amber-50 border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
              <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-black/10">
                <span className="bg-black text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">EDITANDO KARDEX</span>
                <button type="button" onClick={() => setSkuActivo(null)} className="text-xs font-black text-slate-400 hover:text-black">[X] Cancelar</button>
              </div>

              <div className="mb-4">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Producto Bautizado:</span>
                <h3 className="font-black text-base text-slate-900 uppercase leading-snug">{skuActivo.nombre || skuActivo.name}</h3>
                <span className="text-xs font-mono font-black text-amber-700 block mt-0.5">SKU: {skuActivo.sku}</span>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-4 mb-6 shadow-inner">
                <label className="block font-mono text-xs font-black uppercase text-slate-700 mb-2">Ajustar Stock Físico Total:</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0" max="9999" value={nuevoStock}
                    onChange={(e) => setNuevoStock(e.target.value)}
                    className="w-full text-3xl font-mono font-black text-[#1E3859] outline-none bg-transparent"
                  />
                  <span className="text-xs font-mono font-bold text-slate-400">UNIDADES</span>
                </div>
              </div>

              {feedback && (
                <div className={`p-3 rounded-xl border border-black font-mono text-xs font-bold mb-4 ${feedback.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                  {feedback.msg}
                </div>
              )}

              <button
                type="submit" disabled={procesando}
                style={{ backgroundColor: procesando ? '#94a3b8' : theme.primary }}
                className="w-full text-white py-4 rounded-xl border-2 border-black font-mono font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex justify-center gap-2"
              >
                <span>{procesando ? '⏳ Sincronizando...' : '💾 SOBREESCRIBIR BODEGA'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}