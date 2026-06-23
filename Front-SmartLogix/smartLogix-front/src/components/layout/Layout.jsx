import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { theme } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

export default function Layout() {
  // Simulamos 1 item en el carrito como en tu imagen
  const {cartCount} = useCart();

  return (
    <div className="min-h-screen font-sans antialiased text-slate-900 flex flex-col bg-[#E9EEF4] bg-[url('/bg-pattern.png')] bg-repeat">
      {/* NAVBAR IDÉNTICO AL BORRADOR */}
      <header
        style={{ backgroundColor: theme.primary, borderColor: theme.borderDark }}
        className="border-b-4 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md"
      >
        {/* Izquierda: Logo */}
        <div className="flex items-center space-x-3 w-1/2">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/logo.svg" 
              alt="SmartLogix" 
              className="h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Centro: Usuario + Buscador + Enlaces */}
        <div className="flex items-center space-x-6 flex-1 justify-center">
          <Link to="/perfil" className="hover:text-slate-300 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </Link>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar"
              className="w-full bg-transparent text-white placeholder-slate-300 px-4 py-1 rounded-full border-2 border-slate-300 focus:outline-none focus:border-white text-sm"
            />
          </div>

          <nav className="hidden md:flex space-x-6 text-lg tracking-wide">
            <Link to="/categoria/tecnologia" className="hover:text-slate-300 transition-colors">Tecnologia</Link>
            <Link to="/categoria/hardware" className="hover:text-slate-300 transition-colors">Hardware</Link>
            <Link to="/categoria/perifericos" className="hover:text-slate-300 transition-colors">Perifericos</Link>
            <Link to="/categoria/electrodomesticos" className="hover:text-slate-300 transition-colors">Electrodoméstico</Link>
          </nav>
        </div>

        {/* Derecha: Carrito */}
        <div className="flex items-center justify-end w-1/4">
          <Link to="/carrito" className="relative hover:text-slate-300 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* CONTENIDO DINÁMICO */}
      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}