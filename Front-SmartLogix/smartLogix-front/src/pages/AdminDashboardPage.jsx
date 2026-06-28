import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { crearNuevoProducto, actualizarProducto, products } = useProductContext();

  const [form, setForm] = useState({
    sku: '', nombre: '', categoria: 'perifericos', precio: '', stock: '', imagenUrl: '', descripcion: ''
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', texto: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const seleccionarParaEditar = (p) => {
    setAlerta({ tipo: '', texto: '' });
    setModoEdicion(true);
    setForm({
      sku: p.sku || '',
      nombre: p.nombre || '',
      categoria: (p.categoria || 'tecnologia').toLowerCase(),
      precio: p.precio || '',
      stock: '99', 
      imagenUrl: p.imagenes?.[0] || '',
      descripcion: p.descripcion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setForm({ sku: '', nombre: '', categoria: 'perifericos', precio: '', stock: '', imagenUrl: '', descripcion: '' });
  };

  const rellenarConHyperX = () => {
    setModoEdicion(false);
    setForm({
      sku: 'PER-HYP-002',
      nombre: 'Mouse HyperX Pulsefire Haste',
      categoria: 'perifericos',
      precio: '34990',
      stock: '20',
      imagenUrl: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&auto=format&fit=crop&q=60',
      descripcion: 'Diseño ultraligero de panal (59g), sensor Pixart 3335 hasta 16000 DPI, switches TTC Golden.'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ tipo: '', texto: '' });
    setCargando(true);

    try {
      if (modoEdicion) {
        await actualizarProducto(form.sku, form);
        setAlerta({ tipo: 'exito', texto: `¡SKU [${form.sku}] actualizado correctamente en base de datos!` });
      } else {
        await crearNuevoProducto(form);
        setAlerta({ tipo: 'exito', texto: `¡SKU [${form.sku}] creado e inyectado a Bodega 1!` });
      }
      cancelarEdicion();
    } catch (error) {
      setAlerta({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E3859] text-white p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block">Terminal Logística v2.4</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase">Centro de Mando SmartLogix</h1>
        </div>
        <div className="mt-4 sm:mt-0 text-right font-mono text-xs bg-black/30 px-4 py-2 rounded-xl border border-white/10">
          <span className="block text-slate-400">OPERADOR ACTIVO:</span>
          <span className="font-bold text-amber-300">{user?.email || 'Admin'} [{user?.rol}]</span>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE NAVEGACIÓN ENTRE MICROSERVICIOS (ADMINISTRADOR)
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between bg-slate-100 p-4 rounded-2xl border-2 border-black mb-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">Módulo de Catálogo (8084)</span>
        </div>
        <Link
          to="/admin/inventario"
          className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-black rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span className="group-hover:rotate-12 transition-transform text-sm">📦</span>
          <span>Ir al Kardex de Inventario (8083) →</span>
        </Link>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA IZQUIERDA: FORMULARIO DINÁMICO */}
        <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border-2 border-black transition-colors ${
          modoEdicion ? 'bg-amber-50/40 border-amber-600 shadow-[6px_6px_0px_0px_rgba(217,119,6,1)]' : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase text-slate-900">
                  {modoEdicion ? '✏️ Editando Ficha Técnica' : 'Alta de Nuevo SKU'}
                </h2>
                {modoEdicion && <span className="bg-amber-500 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">MODO EDICIÓN</span>}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {modoEdicion ? `Modificando contrato del ítem: ${form.sku}` : 'Emite un contrato gRPC de registro hacia Productos e Inventario'}
              </p>
            </div>
            
            <div className="flex gap-2">
              {modoEdicion ? (
                <button type="button" onClick={cancelarEdicion} className="text-[10px] font-mono bg-red-100 hover:bg-red-200 text-red-800 border border-red-400 px-3 py-1.5 rounded-xl font-bold cursor-pointer">
                  ✖ Cancelar
                </button>
              ) : (
                <button type="button" onClick={rellenarConHyperX} className="text-[10px] font-mono bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 px-3 py-1.5 rounded-xl font-bold cursor-pointer">
                  🪄 Pegar ejemplo: HyperX
                </button>
              )}
            </div>
          </div>

          {alerta.texto && (
            <div className={`p-4 rounded-2xl border-2 font-bold text-xs mb-6 animate-fade-in ${
              alerta.tipo === 'exito' ? 'bg-emerald-100 border-emerald-600 text-emerald-900' : 'bg-red-100 border-red-600 text-red-900'
            }`}>
              {alerta.tipo === 'exito' ? '✅ ' : '❌ '}{alerta.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono flex justify-between">
                  <span>Código SKU</span>
                  {modoEdicion && <span className="text-[9px] text-red-600 lowercase">(inmutable)</span>}
                </label>
                <input 
                  type="text" name="sku" required disabled={modoEdicion} value={form.sku} onChange={handleChange}
                  className="w-full uppercase font-mono bg-slate-50 border-2 border-slate-300 rounded-xl p-3 outline-none disabled:bg-slate-200 disabled:text-slate-500 disabled:border-dashed"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono">Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full uppercase bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-bold text-slate-800">
                  <option value="tecnologia">Tecnología</option>
                  <option value="perifericos">Periféricos</option>
                  <option value="hardware">Hardware</option>
                  <option value="redes">Redes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 font-mono">Nombre Comercial</label>
              <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono">Precio ($ CLP)</label>
                <input type="number" name="precio" required value={form.precio} onChange={handleChange} className="w-full font-mono bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900" />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono text-slate-500">Stock (Ajuste por Kardex)</label>
                <input type="text" disabled value={modoEdicion ? "Gestionado en Bodega" : form.stock} onChange={handleChange} name="stock" className="w-full font-mono bg-slate-100 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 font-mono">URL Foto</label>
              <input type="url" name="imagenUrl" value={form.imagenUrl} onChange={handleChange} className="w-full font-mono text-[11px] bg-slate-50 border-2 border-slate-300 rounded-xl p-3" />
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 font-mono">Descripción</label>
              <textarea name="descripcion" rows="3" required value={form.descripcion} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-normal text-slate-800 text-xs"></textarea>
            </div>

            <button
              type="submit" disabled={cargando}
              className={`w-full text-white py-4 rounded-xl border-2 border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer mt-4 ${
                modoEdicion ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1E3859]'
              }`}
            >
              {cargando ? 'Transmitiendo...' : modoEdicion ? `💾 Sobreescribir Ficha [${form.sku}]` : '⚡ Inyectar SKU a la Base de Datos'}
            </button>
          </form>
        </div>


        {/* COLUMNA DERECHA: RADAR CON CLIC PARA EDITAR */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-black uppercase tracking-wider text-sm">Radar del Catálogo</h3>
              <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/30">
                {products.length} SKUs
              </span>
            </div>
            
            <p className="text-[10px] font-mono text-amber-400/80 mb-4 flex items-center gap-1.5 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20">
              <span>💡</span>
              <span>Haz clic sobre cualquier ítem de la lista para cargarlo en el editor.</span>
            </p>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div 
                  key={p.sku} 
                  onClick={() => seleccionarParaEditar(p)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group ${
                    form.sku === p.sku && modoEdicion
                      ? 'bg-amber-600/30 border-amber-500 translate-x-1'
                      : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="overflow-hidden">
                    <span className="font-mono text-emerald-400 font-bold block text-[11px] group-hover:text-amber-300 transition-colors">
                      {p.sku} {form.sku === p.sku && modoEdicion && '✏️'}
                    </span>
                    <span className="font-bold text-slate-200 truncate block text-xs">{p.nombre}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-amber-400 block">${p.precio}</span>
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-1 py-0.5 rounded uppercase font-mono">{p.categoria}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link to="/categoria/perifericos" className="text-xs font-mono text-emerald-400 hover:underline block">
              ← Ver tienda pública
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}