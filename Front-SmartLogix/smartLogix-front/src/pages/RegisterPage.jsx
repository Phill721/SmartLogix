import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/colors';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(nombre, email, password);
      alert("✅ Cuenta creada con éxito. Ahora puedes iniciar sesión.");
      navigate('/login'); 
    } catch (err) {
      setError(err.message || 'Error al comunicar con el nodo central.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16 select-none font-sans">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Crear Cuenta</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Registro de operador SmartLogix</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Matías Astudillo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Correo Institucional</label>
            <input
              type="email"
              required
              placeholder="matias@smartlogix.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E3859] rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#94a3b8' : theme.primary }}
              className="w-full text-white py-3.5 rounded-xl font-bold text-xs tracking-wide uppercase shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
            >
              {loading ? 'Procesando...' : 'Registrar'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8 pt-6 border-t border-slate-100">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-[#1E3859] hover:underline">
            Ingresar
          </Link>
        </p>

      </div>
    </div>
  );
}