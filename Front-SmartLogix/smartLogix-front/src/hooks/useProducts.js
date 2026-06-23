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
      'https://resource.logitech.com/w_1600,c_limit,q_auto,f_auto,dpr_2.0/content/dam/logitech/en/products/mice/mx-master-3s/mx-master-3s-mouse-top-view-graphite.png?v=1'
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
  { id: 3, sku: 'PER-003', nombre: 'Audífonos Cloth Corsair HS35', descripcion: 'Auriculares estéreo gaming con espuma viscoelástica y transductores de neodimio de 50 mm.', precio: 34990, categoria: 'perifericos', imagenes: ['https://images.tcdn.com.br/img/img_prod/1126521/headset_gamer_corsair_hs35_p2_stereo_verde_car_hs35_green_1873_1_865d1d6400a40669d0d33e8954f9a0f4.jpg'], stock: 0 },
  { id: 4, sku: 'TEC-001', nombre: 'Smartwatch Huawei Band 7', descripcion: 'Pulsera de actividad ultradelgada con monitoreo de SpO2 automático y batería de 2 semanas.', precio: 89990, categoria: 'tecnologia', imagenes: ['https://consumer.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/wearables/band7/img/huawei-band-7-product-wear-black.png'], stock: 20 },
  { id: 5, sku: 'HAR-001', nombre: 'Memoria RAM DDR4 16GB Kingston Fury', descripcion: `• Capacidad de GB en formato SO-DIMM DDR4, ideal para notebooks y mini PC.
    • Bajo voltaje de 1.20 V, contribuyendo a una mayor eficiencia energética.
    • Velocidad de 2666 MT/s que mejora la respuesta y fluidez en el uso diario.
• Latencia CAS 19, adecuada para tareas generales y multitarea.
• Producto OEM de Samsung, reconocido por su calidad y compatibilidad.`, precio: 45000, categoria: 'hardware', imagenes: ['https://media.solotodo.com/media/products/2227826.png'], stock: 8 },
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