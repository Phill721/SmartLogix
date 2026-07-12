import React from 'react';
import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/catalog/ProductCard';

const CATEGORIAS = [
  { key: 'tecnologia',        label: 'Tecnología',       img: '/cat-tecnologia.gif'        },
  { key: 'hardware',          label: 'Hardware',          img: '/cat-hardware.gif'          },
  { key: 'perifericos',       label: 'Periféricos',       img: '/cat-perifericos.gif'       },
  { key: 'electrodomesticos', label: 'Electrodomésticos', img: '/cat-electrodomesticos.gif' },
];

export default function MainPage() {
  const { products } = useProductContext();

  const muestra = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 12)
    .map((p) => ({ ...p, stockTotal: 999, stock: 999 }));

  return (
    <div className="w-full font-sans select-none">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <img src="/logov2.png" alt="SmartLogix" className="h-86 w-auto mb-4 drop-shadow-md" />
        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
          Tecnología al mejor precio
        </p>
      </section>

      {/* ── Categorías ── */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.key}
              to={`/categoria/${c.key}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] border border-slate-200/80 drop-shadow-[0_8px_20px_rgba(30,56,89,0.12)] hover:scale-[1.02] transition-transform duration-300"
            >
              <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3859]/80 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-black text-sm uppercase tracking-wider drop-shadow">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Carrusel ── */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nuestro Catálogo</h2>
          <Link to="/categoria/tecnologia" className="text-xs font-mono font-bold text-[#1E3859] hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-5 px-8 animate-marquee" style={{ width: 'max-content' }}>
            {[...muestra, ...muestra].map((prod, i) => (
              <div key={`${prod.sku}-${i}`} className="w-56 shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre nosotros ── */}
      <section className="relative overflow-hidden py-20 px-4">
        <img
          src="/logov2.png"
          alt=""
          aria-hidden
          className="absolute inset-0 m-auto w-[520px] opacity-[0.04] pointer-events-none select-none"
        />
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <span className="text-[10px] font-mono font-bold text-[#1E3859] uppercase tracking-widest bg-[#1E3859]/10 px-3 py-1 rounded-full">
            Quiénes somos
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-4 mb-6 leading-tight">
            Pasión por la <span className="text-[#1E3859]">tecnología.</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4 font-sans">
            Somos un equipo comprometido con acercar la mejor tecnología a las personas al precio más justo.
            Creemos en la calidad, la transparencia y en la experiencia de compra como algo que debe ser simple, confiable y satisfactorio.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Nuestra historia comenzó con una idea simple: que acceder a productos tecnológicos de calidad
            no debería ser complicado ni caro. Hoy contamos con un catálogo de más de{' '}
            <strong className="text-slate-700">{products.length} productos</strong>, bodega propia y despacho
            a todo el país. Cada producto que ofrecemos pasa por un proceso de validación logística que
            garantiza que lo que ves en pantalla es lo que recibes en tu puerta.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              to="/categoria/tecnologia"
              className="bg-[#1E3859] text-white text-xs font-bold px-8 py-4 rounded-full shadow-lg shadow-[#1E3859]/20 hover:opacity-95 transition-all uppercase tracking-widest"
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gato ── */}
      <div className="flex justify-center py-8">
        <img src="/gato2.gif" alt="gato" className="h-32 w-auto" />
      </div>

    </div>
  );
}