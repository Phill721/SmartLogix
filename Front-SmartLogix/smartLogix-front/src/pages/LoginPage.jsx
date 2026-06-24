import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/colors';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@smartlogix.cl');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/perfil');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white border-2 border-black rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">
        
        {/* Mitad Izquierda Corporativa */}
        <div style={{ backgroundColor: theme.primary }} className="p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span style={{ color: theme.accent }} className="text-xs font-mono uppercase tracking-widest block mb-2">Sesión</span>
            <h2 className="text-3xl font-black leading-tight mb-4">
              Portal de Autenticación Logística
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Accede al panel de control centralizado. Gestiona inventario en tiempo real, emite órdenes de despacho y supervisa la flota de SmartLogix.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 text-xs text-slate-400 font-mono">
            Arquitectura de Microservicios v2.4 • Conexión Segura SSL
          </div>
        </div>

        {/* Mitad Derecha: Formulario */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#EBEFF2]/30">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Iniciar Sesión</h3>
          <p className="text-xs text-slate-500 mb-6 font-mono">Ingresa tus credenciales de acceso institucional</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-xs font-bold mb-4 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Contraseña</label>
                <span className="text-[11px] text-[#1E3859] hover:underline cursor-pointer">¿Olvidaste tu clave?</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: theme.primary }}
              className="w-full text-white py-3.5 rounded-xl border-2 border-black font-extrabold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? 'Verificando credenciales...' : 'Acceder al Sistema'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8">
            ¿No tienes una cuenta de operador?{' '}
            <Link to="/registro" className="font-bold text-[#1E3859] hover:underline">
              Solicitar registro
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}