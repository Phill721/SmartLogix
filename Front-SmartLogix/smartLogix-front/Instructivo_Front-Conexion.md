# SmartLogix — Guía de Implementación Frontend

> **Stack de referencia:** React + TypeScript (basado en HuertoHogarREACT)
> **Backend:** Java (Spring Boot) — módulos: Usuarios, Productos, Inventario, Pedidos
> **Herramientas clave:** Axios, React Hooks, CORS, Payload tipado

---

## 1. Requisitos previos

- npm ≥ 9 (o yarn)
- Backend SmartLogix corriendo localmente (`http://localhost:8080` por defecto)
- Git

---

## 2. Inicializar el proyecto React

```bash
npm create vite@latest smartlogix-frontend -- --template react-ts
cd smartlogix-frontend
npm install
```

### Dependencias principales

```bash
# HTTP client
npm install axios

# Routing
npm install react-router-dom

# (Opcional) Manejo de estado global
npm install zustand

# (Opcional) UI base
npm install @mui/material @emotion/react @emotion/styled
```

---

## 3. Estructura del proyecto

```
smartlogix-frontend/
├── public/
├── src/
│   ├── api/                    # Instancia Axios + llamadas por módulo
│   │   ├── axiosInstance.ts
│   │   ├── usuariosApi.ts
│   │   ├── productosApi.ts
│   │   ├── inventarioApi.ts
│   │   └── pedidosApi.ts
│   ├── components/             # Componentes reutilizables (UI genérico)
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/                  # Custom hooks por módulo
│   │   ├── useUsuarios.ts
│   │   ├── useProductos.ts
│   │   ├── useInventario.ts
│   │   └── usePedidos.ts
│   ├── pages/                  # Vistas principales (una por módulo)
│   │   ├── Usuarios/
│   │   │   ├── UsuariosPage.tsx
│   │   │   └── UsuarioForm.tsx
│   │   ├── Productos/
│   │   │   ├── ProductosPage.tsx
│   │   │   └── ProductoForm.tsx
│   │   ├── Inventario/
│   │   │   ├── InventarioPage.tsx
│   │   │   └── InventarioForm.tsx
│   │   └── Pedidos/
│   │       ├── PedidosPage.tsx
│   │       └── PedidoForm.tsx
│   ├── types/                  # Interfaces TypeScript (payload tipado)
│   │   ├── Usuario.ts
│   │   ├── Producto.ts
│   │   ├── Inventario.ts
│   │   └── Pedido.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── .env
├── vite.config.ts
└── package.json
```

---

## 4. Configuración de CORS

### 4.1 En el backend Java (Spring Boot)

En la clase principal del controlador de cada módulo, agregar:

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {
    // ...
}
```

O de forma global creando una clase de configuración:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

### 4.2 Proxy en desarrollo (Vite)

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

Con esto, en desarrollo todas las llamadas a `/api/...` van al backend sin problemas de CORS.

---

## 5. Instancia Axios centralizada

`src/api/axiosInstance.ts`:

```ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para token (si aplica autenticación JWT)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

`.env`:

```
VITE_API_URL=http://localhost:8080/api
```

---

## 6. Tipos (Payload tipado)

Define los tipos que coinciden con los DTOs del backend.

`src/types/Producto.ts`:

```ts
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

export type ProductoPayload = Omit<Producto, 'id'>;
```

`src/types/Pedido.ts`:

```ts
export interface Pedido {
  id: number;
  usuarioId: number;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  total: number;
  items: PedidoItem[];
}

export interface PedidoItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export type PedidoPayload = Omit<Pedido, 'id'>;
```

> Repite el mismo patrón para `Usuario` e `Inventario` ajustando los campos según los modelos Java del backend.

---

## 7. Servicios API por módulo

### Usuarios

`src/api/usuariosApi.ts`:

```ts
import axiosInstance from './axiosInstance';
import { Usuario, UsuarioPayload } from '../types/Usuario';

export const getUsuarios = () =>
  axiosInstance.get<Usuario[]>('/usuarios');

export const getUsuarioById = (id: number) =>
  axiosInstance.get<Usuario>(`/usuarios/${id}`);

export const createUsuario = (data: UsuarioPayload) =>
  axiosInstance.post<Usuario>('/usuarios', data);

export const updateUsuario = (id: number, data: Partial<UsuarioPayload>) =>
  axiosInstance.put<Usuario>(`/usuarios/${id}`, data);

export const deleteUsuario = (id: number) =>
  axiosInstance.delete(`/usuarios/${id}`);
```

> Repite la misma estructura para `productosApi.ts`, `inventarioApi.ts` y `pedidosApi.ts` usando sus respectivos endpoints.

---

## 8. Custom Hooks

Los hooks encapsulan el estado y las llamadas a la API para cada módulo.

`src/hooks/useProductos.ts`:

```ts
import { useState, useEffect, useCallback } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productosApi';
import { Producto, ProductoPayload } from '../types/Producto';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProductos();
      setProductos(data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const agregar = async (payload: ProductoPayload) => {
    const { data } = await createProducto(payload);
    setProductos((prev) => [...prev, data]);
  };

  const editar = async (id: number, payload: Partial<ProductoPayload>) => {
    const { data } = await updateProducto(id, payload);
    setProductos((prev) => prev.map((p) => (p.id === id ? data : p)));
  };

  const eliminar = async (id: number) => {
    await deleteProducto(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return { productos, loading, error, fetchProductos, agregar, editar, eliminar };
}
```

> Crea hooks equivalentes (`useUsuarios`, `useInventario`, `usePedidos`) siguiendo el mismo patrón.

---

## 9. Páginas por módulo

### Ejemplo: ProductosPage

`src/pages/Productos/ProductosPage.tsx`:

```tsx
import React, { useState } from 'react';
import { useProductos } from '../../hooks/useProductos';
import { Producto } from '../../types/Producto';

const ProductosPage: React.FC = () => {
  const { productos, loading, error, eliminar } = useProductos();
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Productos</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => setSeleccionado(p)}>Editar</button>
                <button onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosPage;
```

---

## 10. Routing

`src/routes.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import UsuariosPage from './pages/Usuarios/UsuariosPage';
import ProductosPage from './pages/Productos/ProductosPage';
import InventarioPage from './pages/Inventario/InventarioPage';
import PedidosPage from './pages/Pedidos/PedidosPage';

export const router = createBrowserRouter([
  { path: '/',           element: <ProductosPage /> },
  { path: '/usuarios',   element: <UsuariosPage /> },
  { path: '/productos',  element: <ProductosPage /> },
  { path: '/inventario', element: <InventarioPage /> },
  { path: '/pedidos',    element: <PedidosPage /> },
]);
```

`src/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

---

## 11. Conexión front-back: resumen de endpoints esperados

| Módulo     | Método | Endpoint                | Descripción               |
|------------|--------|-------------------------|---------------------------|
| Usuarios   | GET    | `/api/usuarios`         | Listar usuarios           |
| Usuarios   | POST   | `/api/usuarios`         | Crear usuario             |
| Usuarios   | PUT    | `/api/usuarios/{id}`    | Actualizar usuario        |
| Usuarios   | DELETE | `/api/usuarios/{id}`    | Eliminar usuario          |
| Productos  | GET    | `/api/productos`        | Listar productos          |
| Productos  | POST   | `/api/productos`        | Crear producto            |
| Productos  | PUT    | `/api/productos/{id}`   | Actualizar producto       |
| Productos  | DELETE | `/api/productos/{id}`   | Eliminar producto         |
| Inventario | GET    | `/api/inventario`       | Ver inventario            |
| Inventario | PUT    | `/api/inventario/{id}`  | Ajustar stock             |
| Pedidos    | GET    | `/api/pedidos`          | Listar pedidos            |
| Pedidos    | POST   | `/api/pedidos`          | Crear pedido              |
| Pedidos    | PUT    | `/api/pedidos/{id}`     | Actualizar estado pedido  |

> Confirma estos endpoints revisando los `@RequestMapping` de cada controlador Java en el backend.

---

## 12. Checklist de implementación

- [ ] Proyecto Vite inicializado con TypeScript
- [ ] Dependencias instaladas (axios, react-router-dom)
- [ ] CORS habilitado en el backend Java
- [ ] Proxy configurado en `vite.config.ts`
- [ ] `axiosInstance.ts` creado con baseURL desde `.env`
- [ ] Tipos definidos para cada módulo (`types/`)
- [ ] Servicios API creados para cada módulo (`api/`)
- [ ] Custom hook creado para cada módulo (`hooks/`)
- [ ] Páginas base creadas para cada módulo (`pages/`)
- [ ] Routing configurado con `react-router-dom`
- [ ] Prueba de conexión: GET a `/api/productos` devuelve datos del backend

---

## 13. Notas de desarrollo

**Manejo de errores con Axios:** Usa `error.response?.data` para leer los mensajes de error que devuelva el backend Java.

**Variables de entorno:** Nunca hardcodees la URL del backend. Usa siempre `import.meta.env.VITE_API_URL`.

**Tipado estricto:** Mantén los tipos (`types/`) sincronizados con los DTOs Java del backend. Si el backend cambia un campo, actualiza la interfaz TypeScript.

**Consistencia con HuertoHogarREACT:** Sigue los mismos patrones de organización de carpetas, naming de hooks y estructura de componentes que en el proyecto de referencia para mantener coherencia entre proyectos del equipo.