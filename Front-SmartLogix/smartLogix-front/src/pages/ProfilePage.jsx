import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rolActual = user?.rol || 'USUARIO';

  // Configuración inteligente del acceso directo según el rol que inició sesión
  const entornoTrabajo = {
    ADMINISTRADOR: {
      titulo: "Centro de Mando Supremo",
      desc: "Tienes control total sobre infraestructura, usuarios e inventario 8083.",
      link: "/admin/dashboard",
      btnText: "Abrir Terminal Admin →",
      estilo: "bg-slate-900 text-white shadow-xl shadow-slate-900/15"
    },
    VENDEDOR: {
      titulo: "Estación Operativa de Bodega",
      desc: "Autorización gRPC activa para ajustar existencias y revisar despachos.",
      link: "/admin/inventario",
      btnText: "Abrir Kardex (8083) →",
      estilo: "bg-[#1E3859] text-white shadow-xl shadow-[#1E3859]/20"
    },
    USUARIO: {
      titulo: "Panel de Comprador",
      desc: "Supervisa el estado en tiempo real de tus paquetes y transacciones.",
      link: "/usuario/pedidos",
      btnText: "Mis Pedidos →",
      estilo: "bg-slate-50 text-slate-800 border border-slate-200 shadow-md shadow-slate-100"
    }
  }[rolActual] || {
    titulo: "Área de Cliente",
    desc: "Consulta tu historial.",
    link: "/usuario/pedidos",
    btnText: "Ver mis pedidos →",
    estilo: "bg-slate-50 text-slate-800 border border-slate-200"
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 font-sans select-none animate-fade-in">
      
      {/* Tarjeta Principal: Blanca pura con borde fino y sombra difusa flotante */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
        
        {/* Banner superior en el azul oficial de SmartLogix */}
        <div className="bg-[#1E3859] absolute top-0 left-0 right-0 h-36 pointer-events-none z-0"></div>

        {/* Cabecera del Usuario */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-16 mb-8 border-b border-slate-100 pb-8">
          
          {/* Avatar levitando sobre el corte del banner */}
          <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-xl shadow-slate-900/10 border border-slate-100 shrink-0">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.nombre || 'user'}`} 
              alt="Avatar" 
              className="w-full h-full object-contain rounded-2xl bg-slate-50" 
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 font-mono">
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full border border-emerald-200">
                ● Conectado
              </span>
              <span className="text-xs text-slate-400">UUID: #{user?.id || '8821'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 capitalize tracking-tight">{user?.nombre}</h1>
            <p className="text-sm font-mono text-slate-500 mt-0.5">{user?.email}</p>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-6 py-2.5 rounded-full font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            Cerrar Sesión
          </button>

        </div>

        {/* Lanzador de Entorno Inteligente (Cambia de color y ruta según seas Admin, Vendedor o Cliente) */}
        <div className={`mb-10 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all ${entornoTrabajo.estilo}`}>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 font-bold block mb-1">
              Entorno Logístico Activo
            </span>
            <h4 className="font-black text-lg tracking-tight leading-snug">{entornoTrabajo.titulo}</h4>
            <p className="text-xs mt-1 opacity-85 font-sans font-normal max-w-md">{entornoTrabajo.desc}</p>
          </div>
          <button
            onClick={() => navigate(entornoTrabajo.link)}
            className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shrink-0 font-mono self-stretch sm:self-auto text-center"
          >
            {entornoTrabajo.btnText}
          </button>
        </div>

        {/* Grid de especificaciones inferiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Privilegio en Base de Datos</span>
              <span className="text-xl font-black text-[#1E3859]">{user?.rol}</span>
              <p className="text-xs text-slate-500 mt-2 font-sans font-normal">
                Permisos validados en cada petición mediante token Bearer JWT.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>GATEWAY: ACTIVO</span>
              <span className="text-emerald-600">200 OK</span>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Seguridad de Cuenta</span>
              <span className="text-sm font-bold text-slate-700 font-sans block">Autenticación 2FA inactiva</span>
              <p className="text-xs text-slate-500 mt-1 font-sans font-normal">
                Recomendado para proteger operaciones de mermas e inventario.
              </p>
            </div>
            <button 
              onClick={() => alert('Generando semilla TOTP para Google Authenticator...')} 
              className="text-xs font-bold text-[#1E3859] hover:underline self-start mt-4 font-sans cursor-pointer inline-flex items-center gap-1"
            >
              <span>Configurar segundo factor</span>
              <span>→</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}