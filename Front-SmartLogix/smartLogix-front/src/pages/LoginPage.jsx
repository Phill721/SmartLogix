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
      // Disparamos hacia nuestro AuthContext.jsx milimétrico
      const usuarioLogueado = await login(email, password);
      
      // DESVÍO DE TRÁFICO SEGÚN ROL DE JAVA:
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
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white border-2 border-black rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">
        
        {/* Mitad Izquierda Corporativa */}
        <div style={{ backgroundColor: theme.primary }} className="p-10 text-white flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span style={{ color: theme.accent }} className="text-xs font-mono uppercase tracking-widest block mb-2">Sesión Institucional</span>
            <h2 className="text-3xl font-black leading-tight mb-4 uppercase tracking-wider">
              SmartLogix RBAC Portal
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Sistema centralizado de despacho, control de inventario de componentes y supervisión de microservicios logísticos.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400 font-mono">
            Arquitectura Distribuida v2.4 • Conexión Segura gRPC/SSL
          </div>
        </div>

        {/* Mitad Derecha: Formulario Limpio */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#EBEFF2]/30">
          <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-wide">Acceso Operador</h3>
          <p className="text-xs text-slate-500 mb-6 font-mono">Ingresa tus credenciales autorizadas en base</p>

          {/* CAJA DE ADVERTENCIA ROJA */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-xl text-xs font-bold mb-4 animate-shake shadow-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-mono tracking-wider">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="admin@smartlogix.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none transition-colors shadow-inner"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Contraseña</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: theme.primary }}
              className="w-full text-white py-3.5 rounded-xl border-2 border-black font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer mt-4 disabled:opacity-50"
            >
              {loading ? 'Consultando Identity Provider...' : 'Acceder al Sistema'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8">
            ¿No posees credenciales institucionales?{' '}
            <Link to="/registro" className="font-bold text-[#1E3859] hover:underline uppercase">
              Solicitar Alta
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}