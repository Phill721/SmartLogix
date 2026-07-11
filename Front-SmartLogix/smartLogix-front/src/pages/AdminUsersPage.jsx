import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 👈 IMPORTANTE: Para la navegación
import { useAuth } from '../context/AuthContext'; // 👈 IMPORTANTE: Para leer el operador activo

export default function AdminUsersPage() {
  const { user } = useAuth(); // Sacamos los datos de sesión para el Header
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchUsuarios = async () => {
    setCargando(true);
    setMsg(null);
    const token = localStorage.getItem('smartlogix_token');
    
    try {
      const res = await fetch('/api/bff/usuarios?page=0&size=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      console.log("🕵️‍♂️ CAJA RECIBIDA DE JAVA:", data);

      if (!res.ok) {
        setMsg({ ok: false, text: `Error del servidor: ${data.message || res.status}` });
        return;
      }

      const arrayReal = data.content || data.data || data.items || data.usuarios || data.lista || (Array.isArray(data) ? data : []);
      setUsuarios(arrayReal);

    } catch (e) { 
      console.error("Error de red:", e);
      setMsg({ ok: false, text: "No se pudo conectar con el microservicio." });
    } finally { 
      setCargando(false); 
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const actualizarRol = async (userObj, nuevoRol) => {
    const token = localStorage.getItem('smartlogix_token');
    setMsg(null);
    try {
      const payload = { nombre: userObj.nombre, email: userObj.email, contrasena: "UNCHANGED_PASSWORD", rol: nuevoRol };
      const res = await fetch(`/api/bff/usuarios/${userObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg({ ok: true, text: `✅ Rol de ${userObj.email} actualizado a ${nuevoRol}` });
        fetchUsuarios();
      }
    } catch (e) { setMsg({ ok: false, text: "❌ Error al reasignar rol." }); }
  };

  const purgarUsuario = async (id, email) => {
    if (!window.confirm(`¿Eliminar acceso de ${email}?`)) return;
    const token = localStorage.getItem('smartlogix_token');
    await fetch(`/api/bff/usuarios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchUsuarios();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none relative font-sans">
      
      {/* ── HEADER IDÉNTICO AL DASHBOARD ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E3859] text-white p-8 rounded-3xl drop-shadow-[0_15px_25px_rgba(30,56,89,0.25)] mb-8 border border-slate-700/30">
        <Link to="/admin" className="cursor-pointer group">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-bold">Terminal Logística v2.4</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase mt-1 group-hover:text-slate-200 transition-colors">Centro de Mando SmartLogix</h1>
        </Link>
        <div className="mt-4 sm:mt-0 text-right font-mono text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <span className="block text-slate-300 text-[10px]">OPERADOR ACTIVO:</span>
          <span className="font-bold text-amber-300">{user?.email || 'Admin'} [{user?.rol}]</span>
        </div>
      </div>

      {/* ── NAVEGACIÓN (Diseño de la imagen, con "Usuarios" ACTIVO) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        
        {/* PESTAÑA ACTIVA: USUARIOS (Azul con puntito verde) */}
        <Link to="/admin/usuarios" className="bg-[#1E3859] border border-[#1E3859] p-4.5 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.15)] transition-all flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase">👥 Usuarios</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
        </Link>

        <Link to="/admin/inventario" className="bg-white hover:bg-slate-50 border border-slate-200 p-4.5 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">📦 Kardex (8083)</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        
        <Link to="/admin/ventas" className="bg-white hover:bg-slate-50 border border-slate-200 p-4.5 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">📊 Ventas</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link to="/admin/pedidos" className="bg-white hover:bg-slate-50 border border-slate-200 p-4.5 rounded-2xl drop-shadow-[0_8px_16px_rgba(30,56,89,0.08)] transition-all flex items-center justify-between group">
          <span className="text-xs font-black text-slate-800 uppercase">🚚 Pedidos Globales</span>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* ── SUB-HEADER TIPO KARDEX ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block font-bold mb-1">
            MICROSERVICIO • PUERTO 8084
          </span>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Directorio de Identidad</h2>
        </div>
        
        <button onClick={fetchUsuarios} className="text-[11px] font-bold bg-white text-[#1E3859] border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer">
          🔄 Sincronizar Red
        </button>
      </div>

      {/* ── MENSAJES DE ALERTA ── */}
      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold mb-6 shadow-sm border animate-fade-in ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
          {msg.text}
        </div>
      )}

      {/* ── TABLA CON DISEÑO PROFUNDO ── */}
      <div className="bg-white border border-slate-200 rounded-3xl drop-shadow-[0_20px_35px_rgba(30,56,89,0.12)] overflow-hidden">
        {cargando ? (
          <div className="p-16 text-center font-mono text-xs text-slate-400 animate-pulse">Sincronizando nodos de identidad...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              
              {/* Cabecera oscura estilo Kardex de tu imagen */}
              <thead className="bg-[#1E3859] border-b border-slate-700/40 text-slate-200 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-4 px-6 font-bold tracking-wider">Usuario</th>
                  <th className="py-4 px-6 font-bold tracking-wider">Correo Institucional</th>
                  <th className="py-4 px-6 font-bold text-center tracking-wider">Rol Asignado</th>
                  <th className="py-4 px-6 font-bold text-right tracking-wider">Acción</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6 font-bold text-slate-900">{u.nombre}</td>
                    <td className="py-5 px-6 font-mono text-slate-500">{u.email}</td>
                    <td className="py-5 px-6 text-center">
                      <select 
                        value={u.rol} onChange={(e) => actualizarRol(u, e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-bold text-[11px] rounded-xl px-3 py-1.5 outline-none border border-transparent focus:bg-white focus:border-[#1E3859] focus:shadow-sm cursor-pointer transition-all"
                      >
                        <option value="USUARIO">USUARIO</option>
                        <option value="VENDEDOR">VENDEDOR</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      </select>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button onClick={() => purgarUsuario(u.id, u.email)} className="text-rose-400 hover:text-rose-600 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] uppercase tracking-wider">
                        Purgar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}