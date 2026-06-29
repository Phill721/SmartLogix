import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/colors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuarioLogueado = await login(email, password);
      
      if (usuarioLogueado?.rol === 'ADMINISTRADOR') {
        navigate('/admin/dashboard');
      } else {
        navigate('/perfil');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el nodo de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16 font-sans select-none animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-3xl drop-shadow-[0_20px_35px_rgba(30,56,89,0.15)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">
        
        {/* Mitad Izquierda Corporativa */}
        <div style={{ backgroundColor: theme.primary }} className="p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-amber-300 border border-white/10 block w-max mb-6">
              Sesión Institucional
            </span>
            <h2 className="text-3xl font-black leading-tight mb-4 tracking-tight">
              Portal RBAC SmartLogix
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Sistema centralizado de despacho, control de inventario de componentes y supervisión de microservicios logísticos orientados a eventos.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 text-[10px] text-slate-400 font-mono">
            Arquitectura Distribuida v2.4 • Conexión Segura gRPC/SSL
          </div>
        </div>

        {/* Mitad Derecha: Formulario Minimalista */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">Acceso Operador</h3>
          <p className="text-xs text-slate-400 mb-8 font-mono">Ingresa tus credenciales autorizadas en base</p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium mb-6 flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="admin@smartlogix.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl px-4 py-3 text-xs text-slate-900 font-medium outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Contraseña</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl px-4 py-3 text-xs text-slate-900 font-medium outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? '#94a3b8' : theme.primary }}
                className="w-full text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#1E3859]/20 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Consultando Identity Provider...' : 'Acceder al Sistema'}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8 pt-6 border-t border-slate-100">
            ¿No posees credenciales institucionales?{' '}
            <Link to="/registro" className="font-bold text-[#1E3859] hover:underline uppercase text-[11px]">
              Solicitar Alta
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}