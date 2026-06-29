import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { crearNuevoProducto, actualizarProducto, eliminarProducto, products } = useProductContext();

  const [form, setForm] = useState({
    sku: '', nombre: '', categoria: 'perifericos', precio: '', stock: '', imagenes: [''], descripcion: ''
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', texto: '' });
  const [modalEliminar, setModalEliminar] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImagenChange = (index, value) => {
    const nuevas = [...form.imagenes];
    nuevas[index] = value;
    setForm({ ...form, imagenes: nuevas });
  };

  const agregarImagen = () => {
    setForm({ ...form, imagenes: [...form.imagenes, ''] });
  };

  const eliminarImagen = (index) => {
    setForm({ ...form, imagenes: form.imagenes.filter((_, i) => i !== index) });
  };

  const seleccionarParaEditar = (p) => {
    setAlerta({ tipo: '', texto: '' });
    setModoEdicion(true);
    setForm({
      sku: p.sku || '',
      nombre: p.nombre || '',
      categoria: (p.categoria || 'tecnologia').toLowerCase(),
      precio: p.precio || '',
      stock: '99',
      imagenes: p.imagenes?.length ? p.imagenes : [''],
      descripcion: p.descripcion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setForm({ sku: '', nombre: '', categoria: 'perifericos', precio: '', stock: '', imagenes: [''], descripcion: '' });
  };

  const rellenarConHyperX = () => {
    setModoEdicion(false);
    setForm({
      sku: 'PER-HYP-002',
      nombre: 'Mouse HyperX Pulsefire Haste',
      categoria: 'perifericos',
      precio: '34990',
      stock: '20',
      imagenes: [
        'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60'
      ],
      descripcion: 'Diseño ultraligero de panal (59g), sensor Pixart 3335 hasta 16000 DPI, switches TTC Golden.'
    });
  };

  const ejecutarEliminacion = async () => {
    if (!modalEliminar) return;
    setAlerta({ tipo: '', texto: '' });
    setCargando(true);
    const skuTarget = modalEliminar.sku;

    try {
      await eliminarProducto(skuTarget);
      setAlerta({ tipo: 'exito', texto: `¡Contrato SKU [${skuTarget}] purgado de la base de datos!` });
      if (form.sku === skuTarget) cancelarEdicion();
      setModalEliminar(null);
    } catch (error) {
      setAlerta({ tipo: 'error', texto: error.message });
      setModalEliminar(null);
    } finally {
      setCargando(false);
    }
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
    <div className="max-w-7xl mx-auto px-4 py-8 select-none relative font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E3859] text-white p-8 rounded-3xl drop-shadow-[0_15px_25px_rgba(30,56,89,0.25)] mb-8 border border-slate-700/30">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-bold">Terminal Logística v2.4</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase mt-1">Centro de Mando SmartLogix</h1>
        </div>
        <div className="mt-4 sm:mt-0 text-right font-mono text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <span className="block text-slate-300 text-[10px]">OPERADOR ACTIVO:</span>
          <span className="font-bold text-amber-300">{user?.email || 'Admin'} [{user?.rol}]</span>
        </div>
      </div>

      {/* ── Navegación ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Link
          to="/admin/usuarios"
          className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group"
        >
          <span className="text-xs font-black text-slate-800 uppercase">👥 Usuarios</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link
          to="/admin/inventario"
          className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group"
        >
          <span className="text-xs font-black text-slate-800 uppercase">📦 Kardex (8083)</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-2xl flex items-center justify-between opacity-60 cursor-not-allowed">
          <span className="text-xs font-black text-slate-500 uppercase">📊 Ventas</span>
        </div>

        <Link
          to="/admin/pedidos"
          className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group"
        >
          <span className="text-xs font-black text-slate-800 uppercase">🚚 Pedidos Globales</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* ── Contenido principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Formulario ── */}
        <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border transition-all ${
          modoEdicion
            ? 'bg-amber-50/60 border-amber-300 drop-shadow-[0_20px_35px_rgba(217,119,6,0.15)]'
            : 'bg-white border-slate-200 drop-shadow-[0_20px_35px_rgba(30,56,89,0.12)]'
        }`}>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">
                  {modoEdicion ? '✏️ Editando Ficha Técnica' : 'Alta de Nuevo SKU'}
                </h2>
                {modoEdicion && (
                  <span className="bg-amber-500 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                    MODO EDICIÓN
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {modoEdicion
                  ? `Modificando contrato del ítem: ${form.sku}`
                  : 'Emite un contrato gRPC hacia Productos e Inventario'}
              </p>
            </div>

            <div className="flex gap-2">
              {modoEdicion ? (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  ✖ Cancelar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={rellenarConHyperX}
                  className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  🪄 Ejemplo HyperX
                </button>
              )}
            </div>
          </div>

          {alerta.texto && (
            <div className={`p-4 rounded-2xl border font-bold text-xs mb-6 ${
              alerta.tipo === 'exito'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {alerta.tipo === 'exito' ? '✅ ' : '❌ '}{alerta.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-500 flex justify-between">
                  <span>Código SKU</span>
                  {modoEdicion && <span className="text-[9px] text-rose-500 lowercase">(inmutable)</span>}
                </label>
                <input
                  type="text" name="sku" required disabled={modoEdicion}
                  value={form.sku} onChange={handleChange}
                  className="w-full uppercase font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-500">Categoría</label>
                <select
                  name="categoria" value={form.categoria} onChange={handleChange}
                  className="w-full uppercase bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 font-bold text-slate-800 outline-none shadow-inner"
                >
                  <option value="tecnologia">Tecnología</option>
                  <option value="perifericos">Periféricos</option>
                  <option value="hardware">Hardware</option>
                  <option value="electrodomesticos">Electrodomésticos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-500">Nombre Comercial</label>
              <input
                type="text" name="nombre" required value={form.nombre} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 text-sm text-slate-900 outline-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-500">Precio ($ CLP)</label>
                <input
                  type="number" name="precio" required value={form.precio} onChange={handleChange}
                  className="w-full font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 text-sm text-slate-900 outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-400">Stock (Ajuste por Kardex)</label>
                <input
                  type="text" disabled
                  value={modoEdicion ? 'Gestionado en Bodega' : form.stock}
                  onChange={handleChange} name="stock"
                  className="w-full font-mono bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Multi-imagen */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="uppercase tracking-wider font-mono text-[11px] text-slate-500">
                  Fotos del Producto
                  <span className="ml-2 text-emerald-600 font-bold">({form.imagenes.length})</span>
                </label>
                <button
                  type="button" onClick={agregarImagen}
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  + Agregar imagen
                </button>
              </div>

              <div className="space-y-2">
                {form.imagenes.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center group">
                    <span className="font-mono text-[10px] text-slate-400 w-4 shrink-0">{i + 1}</span>
                    <input
                      type="url" value={url}
                      onChange={(e) => handleImagenChange(i, e.target.value)}
                      placeholder={`URL imagen ${i + 1}`}
                      className="flex-1 font-mono text-[11px] bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 outline-none shadow-inner transition-all"
                    />
                    {url && (
                      <img
                        src={url} alt=""
                        onError={(e) => (e.target.style.display = 'none')}
                        onLoad={(e) => (e.target.style.display = 'block')}
                        style={{ display: 'none' }}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    {form.imagenes.length > 1 && (
                      <button
                        type="button" onClick={() => eliminarImagen(i)}
                        className="text-slate-300 hover:text-rose-500 transition-colors text-sm px-1 shrink-0 cursor-pointer"
                        title="Quitar imagen"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                La primera imagen será la foto principal del producto.
              </p>
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 font-mono text-[11px] text-slate-500">Descripción</label>
              <textarea
                name="descripcion" rows="3" required
                value={form.descripcion} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl p-3 font-normal text-slate-800 text-xs outline-none shadow-inner"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit" disabled={cargando}
                className={`flex-1 text-white py-4 rounded-xl font-black uppercase tracking-widest drop-shadow-md hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer text-xs ${
                  modoEdicion ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1E3859]'
                }`}
              >
                {cargando
                  ? 'Transmitiendo...'
                  : modoEdicion
                  ? `💾 Guardar Ficha [${form.sku}]`
                  : '⚡ Inyectar SKU a la Base de Datos'}
              </button>

              {modoEdicion && (
                <button
                  type="button" disabled={cargando}
                  onClick={() => setModalEliminar({ sku: form.sku, nombre: form.nombre })}
                  className="px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold transition-all cursor-pointer text-base"
                  title="Dar de baja"
                >
                  🗑️
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Radar del catálogo ── */}
        <div className="bg-[#1E3859] text-white p-6 sm:p-8 rounded-3xl drop-shadow-[0_20px_35px_rgba(30,56,89,0.25)] flex flex-col justify-between border border-slate-700/40">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <h3 className="font-black uppercase tracking-wider text-xs text-slate-200">Radar del Catálogo</h3>
              <span className="bg-emerald-400/20 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-emerald-400/30 font-bold">
                {products.length} SKUs
              </span>
            </div>

            <p className="text-[10px] font-mono text-slate-300 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/5">
              💡 Clic para editar ficha técnica en línea.
            </p>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.sku}
                  onClick={() => seleccionarParaEditar(p)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group ${
                    form.sku === p.sku && modoEdicion
                      ? 'bg-white text-slate-900 border-white font-bold drop-shadow-md scale-[1.02]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div className="overflow-hidden">
                    <span className={`font-mono text-[10px] block font-bold ${
                      form.sku === p.sku && modoEdicion ? 'text-[#1E3859]' : 'text-emerald-400'
                    }`}>
                      {p.sku} {form.sku === p.sku && modoEdicion && '✏️'}
                    </span>
                    <span className="truncate block text-xs mt-0.5">{p.nombre}</span>
                    {p.imagenes?.length > 1 && (
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">
                        📷 {p.imagenes.length} fotos
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className={`font-mono font-black text-xs ${
                      form.sku === p.sku && modoEdicion ? 'text-slate-900' : 'text-amber-300'
                    }`}>
                      ${p.precio}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModalEliminar(p); }}
                      className="text-slate-400 hover:text-rose-400 transition-colors text-[10px]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link to="/categoria/perifericos" className="text-xs font-mono text-slate-300 hover:text-white transition-colors">
              ← Ver tienda pública
            </Link>
          </div>
        </div>
      </div>

      {/* ── Modal eliminar ── */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)] text-slate-800">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-widest block">Acción Irreversible</span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Confirmar Purga</h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ¿Estás completamente seguro de dar de baja el contrato logístico para este ítem?
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl mb-6 font-mono text-xs">
              <span className="text-rose-600 font-bold block text-[11px]">[{modalEliminar.sku}]</span>
              <span className="font-bold text-slate-800 text-sm">{modalEliminar.nombre}</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button" disabled={cargando}
                onClick={() => setModalEliminar(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button" disabled={cargando}
                onClick={ejecutarEliminacion}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl drop-shadow-md transition-all cursor-pointer"
              >
                {cargando ? 'Borrando...' : 'Purga definitiva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
