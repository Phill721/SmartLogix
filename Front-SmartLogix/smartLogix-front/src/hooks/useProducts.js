// src/hooks/useProducts.js

const MOCK_PRODUCTS = [
  {
    id: 1,
    sku: 'PER-001',
    nombre: 'Mouse Óptico Inalámbrico Logitech MX Master 3S',
    descripcion: 'Mouse ergonómico de alta precisión con sensor de 8000 DPI, clics silenciosos y desplazamiento electromagnético MagSpeed. Autonomía de hasta 70 días con carga rápida USB-C.',
    precio: 18990,
    categoria: 'perifericos',
    imagenes: [
      'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS2AtOQDCK-Ufn29MPtLgjRwMYh2i8qI5zHRrRN60GeVWoli2EEqegaUkEHl61JqicUhnsSPoAE-Q_YkDKK5ss5Urynh0ypcpBgusPVsSrhuvSB3dbzzROtdyQ',
      'https://ih1.redbubble.net/image.5499939456.6947/raf,360x360,075,t,fafafa:ca443f4786.jpg'
    ],
    stock: 15
  },
  {
    id: 2,
    sku: 'PER-002',
    nombre: 'Teclado Mecánico RGB Redragon K552 Kumara',
    descripcion: 'Teclado mecánico TKL compacto con switches Outemu Blue, retroiluminación RGB Chroma de 18 modos y estructura interna de acero. Diseñado para resistir derrames y uso intensivo en e-sports.',
    precio: 49990,
    categoria: 'perifericos',
    imagenes: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcCFArq97-U8SHF06NngQ5jiPmYow9EzZCjA&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH_37P9g8OrQ640mTMr-fZBl-IdLzYwWByzA&s',
      'https://i.pinimg.com/736x/fd/ef/ea/fdefea0c02324cac28fb215b2c4aa802.jpg'
    ],
    stock: 5
  },
  { id: 3, sku: 'PER-003', nombre: 'Audífonos Cloth Corsair HS35', descripcion: 'Auriculares estéreo gaming con espuma viscoelástica y transductores de neodimio de 50 mm.', precio: 34990, categoria: 'perifericos', imagenes: ['https://cl-cenco-pim-resizer.ecomm.cencosud.com/unsafe/adaptive-fit-in/3840x0/filters:quality(75)/prd-cl/product-medias/12f149a1-73ff-4de9-a947-efd8ff9c297a/MKIQJQ8NRM/MKIQJQ8NRM-1/1737468967150-MKIQJQ8NRM-1-0.jpg'], stock: 0 },
  { id: 4, sku: 'TEC-001', nombre: 'Smartwatch Huawei Band 7', descripcion: 'Pulsera de actividad ultradelgada con monitoreo de SpO2 automático y batería de 2 semanas.', precio: 89990, categoria: 'tecnologia', imagenes: ['https://consumer.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/wearables/band7/img/huawei-band-7-product-wear-black.png'], stock: 20 },
  {
    id: 5, sku: 'HAR-001', nombre: 'Memoria RAM DDR4 16GB Kingston Fury', descripcion: `• Capacidad de GB en formato SO-DIMM DDR4, ideal para notebooks y mini PC.
    • Bajo voltaje de 1.20 V, contribuyendo a una mayor eficiencia energética.
    • Velocidad de 2666 MT/s que mejora la respuesta y fluidez en el uso diario.
• Latencia CAS 19, adecuada para tareas generales y multitarea.
• Producto OEM de Samsung, reconocido por su calidad y compatibilidad.`, precio: 45000, categoria: 'hardware', imagenes: ['https://media.solotodo.com/media/products/2227826.png'], stock: 8
  },
  {
    id: 6,
    sku: 'ELEC-068',
    nombre: 'Proyector LED Portátil Epson EF-100B',
    descripcion: 'Imágenes brillantes y nítidas para tus presentaciones. El EPSON PowerLite W49 ofrece 4.500 lúmenes de brillo, resolución WXGA y tecnología 3LCD para proyecciones de alta calidad en cualquier entorno.',
    precio: 29990,
    categoria: 'electrodomesticos',
    imagenes: [
      'https://cdn.cs.1worldsync.com/syndication/mediaserverredirect/6aacc1736b940bd3ae2cd4db1074d69c/original.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiP-XmIoaUbaCtNblf2C5EX_yHWUnYBcv9FA&s'
    ],
    stock: 15
  }
];

export function useProducts() {
  const getProductById = (id) => {
    return MOCK_PRODUCTS.find(product => product.id === id) || null;
  };

  const getProductsByCategory = (categoria) => {
    if (!categoria) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  };

  return { getProductById, getProductsByCategory, loading: false, error: null };
}