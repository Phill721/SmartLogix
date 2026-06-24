import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/colors';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Variable booleana para saber si el usuario logueado es el Admin Supremo
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white border-2 border-black rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Banner dinámico: Si es admin se pinta más oscuro */}
        <div 
          style={{ backgroundColor: isAdmin ? '#0D0D0D' : theme.primary }} 
          className="absolute top-0 left-0 right-0 h-28 pointer-events-none transition-colors"
        ></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-12 mb-8 border-b pb-8 border-slate-100">
          <div className="w-32 h-32 bg-[#EBEFF2] border-4 border-black rounded-3xl p-2 shadow-xl shrink-0 bg-white">
            <img src={user?.avatar} alt="Avatar" className="w-full h-full object-contain" />
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Conectado
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: #{user?.id}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 capitalize">{user?.nombre}</h1>
            <p className="text-sm font-mono text-slate-500">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-600 px-6 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer self-center md:self-auto"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* =========================================================================
           BOTÓN MÁGICO: Solo se renderiza si el rol guardado en el contexto es ADMIN
           ========================================================================= */}
        {isAdmin && (
          <div className="mb-8 bg-amber-50 border-2 border-amber-500 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <h4 className="text-amber-900 font-black text-base">Acceso jerárquico detectado</h4>
              <p className="text-amber-700 text-xs mt-0.5">Posees credenciales de nivel de Administrador para modificar la infraestructura logística.</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl border border-black/10 shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              Control de Inventario →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#EBEFF2]/50 border-2 border-black/10 rounded-2xl p-5">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Nivel de Privilegios</span>
            <span className="text-lg font-black text-[#1E3859]">{user?.rol}</span>
            <p className="text-xs text-slate-500 mt-2">Permisos totales para lectura y escritura en la base de datos de inventario.</p>
          </div>

          <div className="bg-[#EBEFF2]/50 border-2 border-black/10 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Seguridad de Cuenta</span>
              <span className="text-sm font-bold text-slate-800 block">Autenticación 2FA Desactivada</span>
            </div>
            <button onClick={() => alert('Generando QR para Google Authenticator...')} className="text-xs font-bold text-[#1E3859] hover:underline self-start mt-2">
              Configurar segundo factor →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}