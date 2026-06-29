import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { theme } from '../theme/colors';

export default function AdminInventoryPage() {
  const { products, loadProducts } = useProductContext();
  
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
        setNuevoStock(
          dataBodega.stockTotal !== undefined 
            ? dataBodega.stockTotal 
            : (dataBodega.cantidad || 0)
        );
      } else {
        setNuevoStock(0);
        setFeedback({ 
          ok: null, 
          msg: `⚠️ SKU sin inventario en bodega. Ingresa la cantidad y presiona Sobreescribir para inicializarlo.` 
        });
      }
    } catch (e) {
      setNuevoStock(0);
      setFeedback({ ok: false, msg: `Error de red: ${e.message}` });
    }
  };

  const impactarKardex = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('smartlogix_token');
    setProcesando(true);
    setFeedback(null);

    try {
      const skuLimpio = skuActivo.sku.toUpperCase().trim();
      const cantidadNumerica = parseInt(nuevoStock, 10);

      // Primero intenta actualizar (PUT)
      const resPut = await fetch(`/api/bff/inventario/${skuLimpio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ cantidad: cantidadNumerica, motivo: "Ajuste manual por consola de administrador" })
      });

      if (!resPut.ok) {
        // Si no existe, lo crea (POST)
        const resPost = await fetch(`/api/bff/inventario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            sku: skuLimpio, 
            stockTotal: cantidadNumerica,
            umbralMinimo: 0,
            bodegaId: 1 
          })
        });

        if (!resPost.ok) {
          const txt = await resPost.text();
          throw new Error(`[${resPost.status}] ${txt}`);
        }
      }

      setFeedback({ ok: true, msg: `Kardex actualizado: [${skuLimpio}] fijado en ${cantidadNumerica} unidades.` });
      await loadProducts();
    } catch (err) {
      setFeedback({ ok: false, msg: `Rechazo en Bodega: ${err.message}` });
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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#1E3859] uppercase tracking-widest bg-[#1E3859]/10 px-3 py-1 rounded-full">
            Microservicio : Puerto 8083
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 uppercase mt-2">
            Kardex Central de Bodega
          </h1>
        </div>

        <div className="w-full sm:w-72">
          <input 
            type="text"
            placeholder="🔍 Filtrar por SKU o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold drop-shadow-[0_4px_10px_rgba(30,56,89,0.06)] outline-none focus:border-[#1E3859] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 items-start">
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden drop-shadow-[0_20px_35px_rgba(30,56,89,0.12)]">
          <div className="bg-[#1E3859] text-white px-6 py-4 font-mono text-xs font-bold flex justify-between items-center">
            <span>INVENTARIO GENERAL ({listaFiltrada.length} SKUs)</span>
            <span className="text-emerald-300">● Bodega Principal Activa</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 font-mono text-[10px] text-slate-400 uppercase sticky top-0 z-10">
                  <th className="py-3.5 px-6 font-semibold">Ítem</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Catálogo RAM</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {listaFiltrada.map((p) => {
                  const nombre = p.nombre || p.name || "Sin título";
                  const foto = p.imagenes?.[0] || p.image || "/public/gato.gif";
                  return (
                    <tr 
                      key={p.sku} onClick={() => seleccionarItem(p)}
                      className={`cursor-pointer transition-colors ${skuActivo?.sku === p.sku ? 'bg-slate-50 font-bold text-[#1E3859]' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img src={foto} alt="" className="w-9 h-9 rounded-xl border border-slate-200 object-contain bg-white p-0.5 shrink-0 shadow-sm" />
                        <span className="truncate max-w-[180px] text-slate-900 font-semibold">{nombre}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{p.sku}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-slate-400">[ En Memoria ]</td>
                      <td className="py-3.5 px-6 text-right font-mono text-[10px] uppercase text-[#1E3859] font-bold">Inspeccionar →</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sticky top-24">
          {!skuActivo ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 font-mono drop-shadow-[0_15px_25px_rgba(30,56,89,0.08)]">
              <span className="text-3xl block mb-2">👈</span>
              <p className="text-xs font-bold text-slate-500 font-sans leading-relaxed">Selecciona un SKU de la tabla para modificar su stock en base de datos.</p>
            </div>
          ) : (
            <form onSubmit={impactarKardex} className="bg-white border border-slate-200 rounded-3xl p-6 drop-shadow-[0_25px_40px_rgba(30,56,89,0.18)] animate-fade-in">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <span className="bg-[#1E3859] text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full">EDITANDO KARDEX</span>
                <button type="button" onClick={() => setSkuActivo(null)} className="text-xs font-bold text-slate-400 hover:text-slate-800 cursor-pointer">✕ Cancelar</button>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Producto Seleccionado:</span>
                <h3 className="font-black text-base text-slate-800 tracking-tight leading-snug mt-0.5">{skuActivo.nombre || skuActivo.name}</h3>
                <span className="text-xs font-mono font-bold text-[#1E3859] block mt-1">SKU: {skuActivo.sku}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-inner">
                <label className="block font-mono text-[11px] font-bold uppercase text-slate-500 mb-2">Stock Físico Total:</label>
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
                <div className={`p-3.5 rounded-xl border font-mono text-xs font-semibold mb-4 ${
                  feedback.ok === true 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : feedback.ok === null
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {feedback.msg}
                </div>
              )}

              <button
                type="submit" disabled={procesando}
                style={{ backgroundColor: procesando ? '#94a3b8' : theme.primary }}
                className="w-full text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest drop-shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex justify-center gap-2"
              >
                <span>{procesando ? '⏳ Transmitiendo...' : '💾 SOBREESCRIBIR BODEGA'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}