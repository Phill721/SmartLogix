import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { theme } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [termino, setTermino] = useState('');

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!termino.trim()) return;

    navigate(`/buscar?q=${encodeURIComponent(termino.trim())}`);
    setTermino('');
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans antialiased text-slate-900 flex flex-col bg-[#E9EEF4] bg-[url('/bg-pattern.png')] bg-repeat">
      
      <header
        style={{ backgroundColor: theme.primary, borderColor: theme.borderDark }}
        className="border-b-4 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md"
      >
        <div className="flex items-center space-x-3 w-1/2">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="SmartLogix" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex items-center space-x-6 flex-1 justify-center">
          {isAuthenticated ? (
            <Link to="/perfil" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-all cursor-pointer">
              <img src={user?.avatar} alt="" className="w-5 h-5 rounded-full bg-white" />
              <span className="text-xs font-bold text-white capitalize max-w-[90px] truncate">
                {user?.nombre?.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="text-xs font-bold text-white hover:opacity-80 transition-opacity uppercase tracking-wider flex items-center gap-1 cursor-pointer">
              <span>👤</span>
              <span>Ingresar</span>
            </Link>
          )}

          {/* Buscador PC */}
          <form onSubmit={handleBuscar} className="relative w-64 hidden sm:block">
            <input
              type="text"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-black/15 text-white placeholder-slate-300 px-4 py-1 rounded-full border-2 border-slate-300 focus:outline-none focus:border-white text-sm outline-none"
            />
          </form>

          <nav className="hidden md:flex space-x-6 text-lg tracking-wide">
            <Link to="/categoria/tecnologia" className="hover:text-slate-300 transition-colors">Tecnologia</Link>
            <Link to="/categoria/hardware" className="hover:text-slate-300 transition-colors">Hardware</Link>
            <Link to="/categoria/perifericos" className="hover:text-slate-300 transition-colors">Perifericos</Link>
            <Link to="/categoria/electrodomesticos" className="hover:text-slate-300 transition-colors">Electrodoméstico</Link>
          </nav>
        </div>

        <div className="flex items-center justify-end w-1/4 space-x-4">
          <Link to="/carrito" className="relative hover:text-slate-300 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-1 hover:text-slate-300 focus:outline-none cursor-pointer"
          >
            {isMenuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Desplegable Móvil */}
      {isMenuOpen && (
        <div style={{ backgroundColor: theme.primary, borderColor: theme.borderDark }} className="md:hidden border-b-4 text-white px-6 py-4 flex flex-col space-y-3 font-bold text-base shadow-xl">
          <form onSubmit={handleBuscar} className="sm:hidden pb-2 border-b border-white/10 mb-1">
            <input type="text" value={termino} onChange={(e) => setTermino(e.target.value)} placeholder="Buscar..." className="w-full bg-black/10 text-white placeholder-slate-300 px-4 py-1.5 rounded-full border border-slate-300 text-sm outline-none" />
          </form>

          <Link to="/categoria/tecnologia" onClick={() => setIsMenuOpen(false)}>Tecnologia</Link>
          <Link to="/categoria/hardware" onClick={() => setIsMenuOpen(false)}>Hardware</Link>
          <Link to="/categoria/perifericos" onClick={() => setIsMenuOpen(false)}>Perifericos</Link>
          <Link to="/categoria/electrodomesticos" onClick={() => setIsMenuOpen(false)}>Electrodoméstico</Link>
        </div>
      )}

      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        <Outlet />
      </main>

      <footer className="w-full text-center py-4 bg-slate-200/50 border-t border-slate-300/40 mt-auto select-none">
        <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
          SmartLogix© {new Date().getFullYear()}
        </span>
      </footer>

    </div>
  );
}