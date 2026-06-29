import React, { useState, useEffect } from 'react';

export default function AdminUsersPage() {
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
      
      // 🕵️‍♂️ ORO PURO: Esto va a escupir en tu consola el JSON exacto de Java
      console.log("🕵️‍♂️ CAJA RECIBIDA DE JAVA:", data);

      if (!res.ok) {
        setMsg({ ok: false, text: `Error del servidor: ${data.message || res.status}` });
        return;
      }

      // El algoritmo rastreador: busca el array donde sea que Java lo haya escondido
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
    if (!confirm(`¿Eliminar acceso de ${email}?`)) return;
    const token = localStorage.getItem('smartlogix_token');
    await fetch(`/api/bff/usuarios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchUsuarios();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans select-none">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#1E3859] uppercase tracking-widest bg-[#1E3859]/10 px-3 py-1 rounded-full">
            Directorio Central
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2">Gestión de Usuarios</h1>
        </div>
        
        <button onClick={fetchUsuarios} className="self-start sm:self-auto text-xs font-bold bg-white text-[#1E3859] border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer">
          🔄 Actualizar lista
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold mb-6 shadow-sm border ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {cargando ? (
          <div className="p-16 text-center font-mono text-xs text-slate-400 animate-pulse">Sincronizando nodos de identidad...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-4 px-6 font-bold">Usuario</th>
                  <th className="py-4 px-6 font-bold">Correo Institucional</th>
                  <th className="py-4 px-6 font-bold text-center">Rol Asignado</th>
                  <th className="py-4 px-6 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{u.nombre}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{u.email}</td>
                    <td className="py-4 px-6 text-center">
                      <select 
                        value={u.rol} onChange={(e) => actualizarRol(u, e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-bold text-[11px] rounded-xl px-3 py-1.5 outline-none border border-transparent focus:bg-white focus:border-[#1E3859] focus:shadow-sm cursor-pointer transition-all"
                      >
                        <option value="USUARIO">USUARIO</option>
                        <option value="VENDEDOR">VENDEDOR</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => purgarUsuario(u.id, u.email)} className="text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[11px]">
                        Eliminar
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