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
      navigate('/perfil');
    } catch (err) {
      setError('Error al registrar el usuario en el nodo central.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 mb-1 text-center">Crear Cuenta</h2>
        <p className="text-xs text-slate-500 mb-6 text-center font-mono">Alta de nuevo operador en SmartLogix</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-xs font-bold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Matías Astudillo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Institucional</label>
            <input
              type="email"
              required
              placeholder="matias@smartlogix.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña de acceso</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#EBEFF2]/50 border-2 border-slate-300 focus:border-[#1E3859] rounded-xl px-4 py-3 text-sm font-medium outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: theme.primary }}
            className="w-full text-white py-3.5 rounded-xl border-2 border-black font-extrabold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer mt-4"
          >
            {loading ? 'Emitiendo certificado...' : 'Registrar en Base de Datos'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 pt-6 border-t border-slate-100">
          ¿Ya posees credenciales?{' '}
          <Link to="/login" className="font-bold text-[#1E3859] hover:underline">
            Ingresar aquí
          </Link>
        </p>
      </div>
    </div>
  );
}