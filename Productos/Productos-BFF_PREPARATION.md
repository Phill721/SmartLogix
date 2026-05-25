# Preparación del microservicio `Productos` para integración con BFF

Este documento describe el propósito del microservicio de catálogo `Productos`, sus endpoints, requisitos (Redis, MySQL, JWT), ejemplos de uso y una checklist de preparación para integrarlo con un BFF o con otros microservicios.

## Propósito
- Servicio de catálogo que gestiona productos: crear, listar, buscar, actualizar y eliminar.
- Diseñado para ser consumido por un BFF o por otros microservicios (p. ej. Carrito, Pedidos).
- Implementa cache (Redis) para optimizar lecturas de productos y reduce la carga en la base de datos.

## Resumen ejecutivo (qué hacer primero)
1. Asegurar la estrategia de validación de JWT entre `Usuarios` y `Productos` (la implementación actual usa HMAC con `jwt.secret`).
2. Levantar una instancia de Redis accesible (por defecto `localhost:6379`) para que la cache funcione entre instancias.
3. Verificar la conexión a la base de datos MySQL definida en `application.properties`.
4. Exponer OpenAPI/Swagger si quieres contratos legibles por BFF y generación automática de clientes.

## Endpoints (resumen)
- `POST /api/productos` — Crear producto. Roles permitidos: `ADMINISTRADOR`, `VENDEDOR`.
- `GET /api/productos` — Listar productos paginados. Query params: `page` (default 0), `size` (default 20).
- `GET /api/productos/{sku}` — Obtener producto por SKU.
- `GET /api/productos/exists/{sku}` — Verificar existencia del SKU.
- `GET /api/productos/buscar/nombre?nombre=...` — Buscar por nombre (paginar).
- `GET /api/productos/buscar/categoria?categoria=...` — Buscar por categoría (paginar).
- `GET /api/productos/buscar/precio?min=...&max=...` — Buscar por rango de precio (paginar).
- `PUT /api/productos/{sku}` — Actualizar producto. Roles: `ADMINISTRADOR`, `VENDEDOR`.
- `DELETE /api/productos/{sku}` — Eliminar producto. Rol: `ADMINISTRADOR`.

> Implementación: ver `Productos/src/main/java/com/smartlogix/Productos/controller/ProductoController.java`.

## Contratos (DTOs)
- Request: `ProductoRequestDTO` (campos obligatorios: `sku`, `nombre`, `descripcion`, `precio` > 0, `categoria`, `imagenes` al menos 1).
- Response: `ProductoResponseDTO` (campos devueltos: `sku`, `nombre`, `descripcion`, `categoria`, `precio`, `imagenes`).

Archivos relevantes: `src/main/java/com/smartlogix/Productos/dto/ProductoRequestDTO.java`, `src/main/java/com/smartlogix/Productos/dto/ProductoResponseDTO.java`.

## Seguridad (JWT)
- `JwtFilter` valida el header `Authorization: Bearer <token>` y obtiene `rol` desde los claims para asignar `ROLE_<rol>`.
- `JwtUtil` usa HMAC SHA-256 con la propiedad `jwt.secret` (ver `application.properties`).
- `SecurityConfig` configura seguridad stateless y exige autenticación para todas las rutas.

Recomendaciones:
- Para producción, evaluar migrar a RS256 + JWKS o implementar un endpoint de introspección en el servicio de `Usuarios`.
- Si se mantiene HMAC, almacenar el secreto en un vault (Azure Key Vault, HashiCorp Vault, etc.).

## Cache y Redis
- El proyecto habilita caching (`@EnableCaching`) y usa anotaciones `@Cacheable`/`@CacheEvict` en el servicio:
  - Cache `productos`: listado paginado.
  - Cache `producto` con key `#sku`: detalle por SKU.
- Configuración por defecto en `application.properties`:
  - `spring.data.redis.host` (ej. `localhost`)
  - `spring.data.redis.port` (ej. `6379`)
- Dependencias incluidas: `spring-boot-starter-data-redis`, `spring-boot-starter-cache`.

Operativa:
- Levantar Redis para entornos de desarrollo y staging; en producción usar un cluster gestionado.
- La coherencia entre instancias requiere Redis centralizado.
- Las anotaciones existentes invalidan caches (`@CacheEvict`) en creación, actualización y eliminación.

## Base de datos
- MySQL configurado en `application.properties`:
  - `spring.datasource.url=jdbc:mysql://localhost:3306/smartlogix_productos`
  - `spring.datasource.username` y `spring.datasource.password`
  - `spring.jpa.hibernate.ddl-auto=update` (cambiar para producción).
- Entidad principal: `Producto` (ver `src/main/java/com/smartlogix/Productos/models/Producto.java`).

## Dependencias importantes (pom.xml)
- `spring-boot-starter-data-jpa`, `mysql-connector-j`
- `spring-boot-starter-webmvc`
- `spring-boot-starter-security`, `jjwt` (para JWT)
- `spring-boot-starter-data-redis`, `spring-boot-starter-cache`

## Propiedades útiles
- `server.port=8084`
- `jwt.secret` y `jwt.expiration`
- `spring.data.redis.host` / `spring.data.redis.port`
- `app.seed.admin.nombre` / `app.seed.admin.contrasena` (valores para seed admin)

## Ejemplos de uso (curl)
- Listar productos (paginado):

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8084/api/productos?page=0&size=20"
```

- Obtener por SKU:

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8084/api/productos/ABC-123"
```

- Crear producto (rol `ADMINISTRADOR` o `VENDEDOR`):

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "sku":"ABC-123",
    "nombre":"Nombre producto",
    "descripcion":"Descripción",
    "precio": 19.99,
    "categoria":"Electronica",
    "imagenes":["http://.../img1.jpg"]
  }' \
  "http://localhost:8084/api/productos"
```

- Verificar existencia de SKU:

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8084/api/productos/exists/ABC-123"
```

## Checklist para preparar el microservicio antes de integrar con BFF
- [ ] Confirmar estrategia JWT entre `Usuarios` y `Productos` (HMAC vs RS256/JWKS vs introspección).
- [ ] Almacenar `jwt.secret` en secreto gestionado (vault) si se usa HMAC.
- [ ] Levantar Redis accesible y validar la configuración (`spring.data.redis.*`).
- [ ] Revisar `spring.jpa.hibernate.ddl-auto` (evitar `update` en producción sin migraciones controladas).
- [ ] Añadir OpenAPI/Swagger para facilitar integración con BFF.
- [ ] Añadir pruebas de integración que validen seguridad y comportamiento de cache.
- [ ] Configurar CORS si el BFF o frontend necesitan acceso directo (recomiendo que sólo el BFF sea público).
- [ ] Añadir logging/auditoría para creación/actualización/eliminación de productos.

## Notas operativas y recomendaciones
- El filtro JWT espera el claim `rol` y construye `ROLE_<rol>`; asegurar que el issuer del token incluya este claim.
- La cache está gestionada por anotaciones en `ProductoService` y se invalida automáticamente en mutaciones.
- Para alta concurrencia o múltiples réplicas, usar Redis centralizado para coherencia de cache.
- Considerar la adición de eventos (ej. `product.created`, `product.updated`, `product.deleted`) para notificar a otros micros.

## Archivos clave (para revisar)
- Controlador: `src/main/java/com/smartlogix/Productos/controller/ProductoController.java`
- Servicio: `src/main/java/com/smartlogix/Productos/service/ProductoService.java`
- Repositorio: `src/main/java/com/smartlogix/Productos/repository/ProductoRepository.java`
- Modelo: `src/main/java/com/smartlogix/Productos/models/Producto.java`
- DTOs: `src/main/java/com/smartlogix/Productos/dto/ProductoRequestDTO.java`, `src/main/java/com/smartlogix/Productos/dto/ProductoResponseDTO.java`
- Seguridad: `src/main/java/com/smartlogix/Productos/security/JwtFilter.java`, `src/main/java/com/smartlogix/Productos/security/JwtUtil.java`, `src/main/java/com/smartlogix/Productos/config/SecurityConfig.java`
- Properties: `src/main/resources/application.properties`
- POM: `pom.xml`

---
Documento generado automáticamente para facilitar la integración del microservicio `Productos` con un BFF y otros servicios.
