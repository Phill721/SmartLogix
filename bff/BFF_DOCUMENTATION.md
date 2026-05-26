# Documentación del BFF

Resumen
-------

Este documento describe la arquitectura y los endpoints del BFF (Backend-for-Frontend) ubicado en este módulo. El BFF expone endpoints bajo `/api/bff/*`, valida (passthrough) autorización mediante el header `Authorization` y delega la lógica a los microservicios de Productos, Usuarios, Inventario y Pedidos.

Arquitectura y componentes principales
------------------------------------

- **Aplicación**: [BffApplication.java](src/main/java/com/smartlogix/bff/BffApplication.java#L1)
- **Controladores (endpoints)**:
  - [AuthController](src/main/java/com/smartlogix/bff/controller/AuthController.java#L1)
  - [ProductosBffController](src/main/java/com/smartlogix/bff/controller/ProductosBffController.java#L1)
  - [InventarioBffController](src/main/java/com/smartlogix/bff/controller/InventarioBffController.java#L1)
  - [PedidosBffController](src/main/java/com/smartlogix/bff/controller/PedidosBffController.java#L1)
- **Clients (conexiones a microservicios)**:
  - [UsuariosClient](src/main/java/com/smartlogix/bff/client/UsuariosClient.java#L1)
  - [ProductosClient](src/main/java/com/smartlogix/bff/client/ProductosClient.java#L1)
  - [InventarioClient](src/main/java/com/smartlogix/bff/client/InventarioClient.java#L1)
  - [PedidosClient](src/main/java/com/smartlogix/bff/client/PedidosClient.java#L1)
- **DTOs**: [src/main/java/com/smartlogix/bff/dto/](src/main/java/com/smartlogix/bff/dto/)
- **Configuración**: [application.properties](src/main/resources/application.properties#L1)

Configuración y variables importantes
-----------------------------------

Las URLs de los microservicios se leen desde `application.properties`:

- `usuarios.url` — URL base del servicio de Usuarios (ej: `http://localhost:8081`).
- `productos.url` — URL base del servicio de Productos (ej: `http://localhost:8084`).
- `inventario.url` — URL base del servicio de Inventario (ej: `http://localhost:8083`).
- `pedidos.url` — URL base del servicio de Pedidos (ej: `http://localhost:8087`).

Ejecutar localmente
-------------------

Desde la raíz del módulo `bff`:

```bash
./mvnw spring-boot:run
```

O usando el empaquetado:

```bash
./mvnw package
java -jar target/bff-0.0.1-SNAPSHOT.jar
```

Seguridad
---------

La configuración en `SecurityConfig` actualmente permite todas las peticiones (`anyRequest().permitAll()`) y desactiva CSRF. Por tanto la seguridad se delega al header `Authorization` que los controllers reenvían a los microservicios. Archivo: [SecurityConfig.java](src/main/java/com/smartlogix/bff/config/SecurityConfig.java#L1)

Cómo funciona el BFF (flujo)
---------------------------

1. El cliente hace una petición a un endpoint del BFF (por ejemplo `/api/bff/productos`).
2. El controller del BFF extrae el header `Authorization` (si aplica) y/o el body/params.
3. El controller delega la llamada al client correspondiente (p. ej. `ProductosClient`) que usa `RestClient` con la `baseUrl` configurada.
4. El client realiza la petición HTTP al microservicio y devuelve o transforma la respuesta (podría lanzar `ApiClientException` en caso de error).
5. El controller puede combinar respuestas de varios servicios (p. ej. `obtenerCompleto` junta `productos` + `inventario`).

Endpoints (resumen por controlador)
----------------------------------

Auth / Usuarios — [AuthController](src/main/java/com/smartlogix/bff/controller/AuthController.java#L1)

- POST `/api/bff/usuarios/login`
  - Body: `LoginRequestDTO`
  - Response: `LoginResponseDTO`
  - Usa: `UsuariosClient.login`

- POST `/api/bff/usuarios/register`
  - Body: `UsuarioRequestDTO`
  - Response: `UsuarioResponseDTO`
  - Usa: `UsuariosClient.registrarUsuario`

- GET `/api/bff/usuarios`
  - Headers: `Authorization`
  - Query params: `page` (default 0), `size` (default 20)
  - Response: `PageResponseDTO<UsuarioResponseDTO>`

- GET `/api/bff/usuarios/{id}`
  - Headers: `Authorization`
  - Response: `UsuarioResponseDTO`

- PUT `/api/bff/usuarios/{id}`
  - Headers: `Authorization`
  - Body: `UsuarioRequestDTO`
  - Response: `UsuarioResponseDTO`

- DELETE `/api/bff/usuarios/{id}`
  - Headers: `Authorization`

- PATCH `/api/bff/usuarios/{id}/desactivar`
  - Headers: `Authorization`

- PATCH `/api/bff/usuarios/{id}/desbloquear`
  - Headers: `Authorization`

Productos — [ProductosBffController](src/main/java/com/smartlogix/bff/controller/ProductosBffController.java#L1)

- GET `/api/bff/productos`
  - Headers: `Authorization`
  - Query params: `page` (0), `size` (20)
  - Response: `PageResponseDTO<ProductoResponseDTO>`

- GET `/api/bff/productos/{sku}`
  - Headers: `Authorization`
  - Response: `ProductoResponseDTO`

- POST `/api/bff/productos`
  - Headers: `Authorization`
  - Body: `ProductoRequestDTO`
  - Response: `ProductoResponseDTO`

- GET `/api/bff/productos/buscar/nombre?nombre=...`
  - Headers: `Authorization`
  - Response: `PageResponseDTO<ProductoResponseDTO>`

- PUT `/api/bff/productos/{sku}`
  - Headers: `Authorization`
  - Body: `ProductoRequestDTO`

- DELETE `/api/bff/productos/{sku}`

- GET `/api/bff/productos/buscar/categoria?categoria=...`

- GET `/api/bff/productos/completo/{sku}`
  - Headers: `Authorization` (nota: en el controller se llama primero a `productos` y luego a `inventario` para construir `ProductoCompletoDTO`).

Inventario — [InventarioBffController](src/main/java/com/smartlogix/bff/controller/InventarioBffController.java#L1)

- POST `/api/bff/inventario`
  - Headers: `Authorization`
  - Body: `InventarioRequestDTO`
  - Response: `InventarioDTO` (201 Created)

- GET `/api/bff/inventario/{sku}`
  - Headers: `Authorization`

- GET `/api/bff/inventario/bodega/{bodegaId}`
  - Headers: `Authorization`
  - Response: `List<InventarioDTO>`

- POST `/api/bff/inventario/{id}/ajuste`
  - Headers: `Authorization`
  - Body: `AjusteRequestDTO`

- GET `/api/bff/inventario/{id}/movimientos`
  - Headers: `Authorization`
  - Response: `List<MovimientoDTO>`

Pedidos — [PedidosBffController](src/main/java/com/smartlogix/bff/controller/PedidosBffController.java#L1)

- GET `/api/bff/pedidos/carrito`
  - Headers: `Authorization`
  - Response: `CarritoResponseDTO`

- POST `/api/bff/pedidos/carrito/agregar`
  - Headers: `Authorization`
  - Body: `AgregarAlCarritoRequestDTO`

- DELETE `/api/bff/pedidos/carrito/items/{itemId}`
  - Headers: `Authorization`

- PUT `/api/bff/pedidos/carrito/items/{itemId}?cantidad=...`
  - Headers: `Authorization`

- DELETE `/api/bff/pedidos/carrito/vaciar` (NO_CONTENT)

- POST `/api/bff/pedidos/pedidos` (crear pedido) — 201 Created
  - Headers: `Authorization`
  - Body: `CrearPedidoRequestDTO`

- POST `/api/bff/pedidos/pedidos/{pedidoId}/confirmar`
- POST `/api/bff/pedidos/pedidos/{pedidoId}/cancelar`
- GET `/api/bff/pedidos/pedidos/{pedidoId}`
- GET `/api/bff/pedidos/pedidos` (listar; params: `page`, `size`, `estado`)

Clients y manejo de errores
---------------------------

- Cada client (`*Client`) usa `RestClient` con `baseUrl` tomada desde `application.properties`.
- En caso de respuesta con status de error, los clients lanzan `ApiClientException` (ver `src/main/java/com/smartlogix/bff/exception/ApiClientException.java`).

Ejemplos rápidos (curl)
----------------------

- Login (registro público):

```bash
curl -X POST http://localhost:8080/api/bff/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","contrasena":"pass"}'
```

- Listar productos (con token):

```bash
curl -X GET 'http://localhost:8080/api/bff/productos?page=0&size=20' \
  -H 'Authorization: Bearer <TOKEN>'
```

- Obtener producto completo (producto + inventario):

```bash
curl -X GET http://localhost:8080/api/bff/productos/completo/ABC123 \
  -H 'Authorization: Bearer <TOKEN>'
```

Dónde mirar el código
---------------------

- Controladores: [src/main/java/com/smartlogix/bff/controller/](src/main/java/com/smartlogix/bff/controller/)
- Clients: [src/main/java/com/smartlogix/bff/client/](src/main/java/com/smartlogix/bff/client/)
- DTOs: [src/main/java/com/smartlogix/bff/dto/](src/main/java/com/smartlogix/bff/dto/)
- Configuración: [src/main/resources/application.properties](src/main/resources/application.properties#L1)

