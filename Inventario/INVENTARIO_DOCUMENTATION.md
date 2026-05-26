# Documentación del Servicio de Inventario

Resumen
-------

Este documento describe la arquitectura, endpoints y el flujo de trabajo del microservicio de Inventario ubicado en este módulo. El servicio expone APIs REST para gestionar existencias, movimientos y ajustes por bodega/sku, registra los movimientos que afectan el stock y aplica controles de acceso para operaciones sensibles.

Arquitectura y componentes principales
------------------------------------

- **Aplicación**: [src/main/java](Inventario/src/main/java/)
- **Controladores (endpoints)**: `InventarioController` en `src/main/java/com/smartlogix/inventario/controller/InventarioController.java`.
- **Servicios**: implementaciones en el paquete `service` que contienen la lógica de negocio (ajustes, reservas, validaciones de stock).
- **Repositorios / Persistencia**: interfaces `repository` (Spring Data JPA u otro) que acceden a la base de datos.
- **DTOs / Modelos**: `dto` y `model` bajo `src/main/java`.
- **Configuración**: [src/main/resources/application.properties](Inventario/src/main/resources/application.properties#L1) y/o `application.yml`.

Configuración y variables importantes
-----------------------------------


Las propiedades relevantes suelen encontrarse en `application.properties` o `application.yml` y pueden incluir:

- `spring.datasource.*` — configuración de la base de datos (URL, usuario, contraseña).
- `server.port` — puerto en el que corre el servicio.
- Timeouts y settings de JPA/Hibernate (`spring.jpa.*`).
- Parámetros de integración (si aplica) con otros servicios o colas.

Ejecutar localmente
-------------------

Desde la raíz del módulo `Inventario`:

```bash
./mvnw spring-boot:run
```

O empaquetando y ejecutando el JAR:

```bash
./mvnw package
java -jar target/servicio-inventario-0.0.1-SNAPSHOT.jar
```

Seguridad
---------

El servicio usa anotaciones `@PreAuthorize` para restringir rutas sensibles. En `InventarioController`:

- `POST /api/inventario` requiere roles `ADMINISTRADOR` o `VENDEDOR`.
- `POST /api/inventario/{id}/ajuste` requiere rol `ADMINISTRADOR`.

El resto de endpoints son públicos en el controller pero en despliegues reales es probable que se valide `Authorization` a nivel de gateway/BFF. Revisar clases de seguridad en `src/main/java`.

Cómo funciona el Inventario (flujo)
---------------------------------

1. Crear/registrar un ítem de inventario: el cliente `POST /api/inventario` envía un `InventarioRequest` con `sku`, `bodegaId`, `stockTotal`, etc.
2. El controller valida el request y delega a la capa `service`.
3. El service aplica reglas de negocio (validaciones, bloqueos de stock, generación de movimiento) y persiste cambios usando el `repository`.
4. Para ajustes manuales (incremento/decremento) se crea un registro de `Movimiento` que queda almacenado para auditoría.
5. Las consultas (por `sku`, por `bodegaId`) devuelven snapshots de la existencia actual, y existe un endpoint para listar movimientos históricos por inventario.

Endpoints (resumen)
-------------------

Endpoints (detallados) — ruta base: `/api/inventario`

Todas las rutas están definidas en `InventarioController` ([InventarioController.java](src/main/java/com/smartlogix/inventario/controller/InventarioController.java#L18)).

- POST `/api/inventario`
  - Headers: `Authorization` (Bearer) — roles: `ADMINISTRADOR`, `VENDEDOR`.
  - Body: `InventarioRequest` (JSON)
  - Response: `Inventario` (201 Created)

- GET `/api/inventario/{sku}`
  - Response: `Inventario` (200 OK)

- GET `/api/inventario/bodega/{bodegaId}`
  - Response: `List<Inventario>` (200 OK)

- POST `/api/inventario/{id}/ajuste`
  - Headers: `Authorization` (Bearer) — rol: `ADMINISTRADOR`.
  - Body: `AjusteRequest` (JSON)
  - Response: `Inventario` (200 OK)

- GET `/api/inventario/{id}/movimientos`
  - Response: `List<MovimientoDTO>` (200 OK)

- POST `/api/inventario` — Crear nuevo registro de inventario (Body: `InventarioRequestDTO`). Responde `InventarioDTO` (201 Created).
- GET `/api/inventario/{sku}` — Obtener inventario por `sku`.
- GET `/api/inventario/bodega/{bodegaId}` — Listar inventario por bodega. Responde `List<InventarioDTO>`.
- POST `/api/inventario/{id}/ajuste` — Aplicar un ajuste sobre un registro (Body: `AjusteRequestDTO`).
- GET `/api/inventario/{id}/movimientos` — Listar movimientos históricos asociados a un registro de inventario. Responde `List<MovimientoDTO>`.

Detalle de contratos y DTOs
--------------------------

Detalle de contratos y DTOs (nombres reales en código)

Revisar `src/main/java/com/smartlogix/inventario/dto` para los contratos exactos. Campos principales:

- `InventarioRequest` (`InventarioRequest.java`)
  - `sku` (String)
  - `productoId` (Long)
  - `bodegaId` (Long)
  - `stockTotal` (Integer)
  - `umbralMinimo` (Integer)

- `AjusteRequest` (`AjusteRequest.java`)
  - `cantidad` (Integer)
  - `motivo` (String)

- `MovimientoDTO` (`MovimientoDTO.java`)
  - `id` (Long)
  - `cantidad` (Integer)
  - `tipoMovimiento` (String)
  - `motivo` (String)
  - `fecha` (LocalDateTime)
  - `usuarioResponsable` (String)

- `Inventario` (entity response — `Inventario.java`)
  - `id`, `sku`, `productoId`, `bodegaId`, `stockTotal`, `stockReservado`, `umbralMinimo`, `fechaCreacion`, `fechaActualizacion`.
  - Método útil: `getStockDisponible()` = `stockTotal - stockReservado`.

Clients y manejo de errores
---------------------------

Clients y manejo de errores

- La comunicación interna dentro del servicio ocurre entre controllers → services → repositories (`InventarioService`).
- Excepciones globales se manejan por `GlobalExceptionHandler` en `src/main/java/com/smartlogix/inventario/exception/GlobalExceptionHandler.java`.
- Errores típicos: `NotFound` (404) cuando no existe SKU/inventario, `BadRequest`/`Conflict` para reglas de negocio, y 500 para errores no esperados.

Ejemplos rápidos (curl)
----------------------

Ejemplos rápidos (curl)

- Crear inventario:

```bash
curl -X POST http://localhost:8083/api/inventario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"sku":"ABC123","productoId":10,"bodegaId":1,"stockTotal":100,"umbralMinimo":5}'
```

- Obtener inventario por sku:

```bash
curl -X GET http://localhost:8083/api/inventario/ABC123
```

- Aplicar ajuste (reducción por venta):

```bash
curl -X POST http://localhost:8083/api/inventario/42/ajuste \
  -H "Content-Type: application/json" \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"cantidad":5,"motivo":"Venta"}'
```

Ejemplo de respuesta `Inventario` (parcial):

```json
{
  "id": 42,
  "sku": "ABC123",
  "productoId": 10,
  "bodegaId": 1,
  "stockTotal": 95,
  "stockReservado": 0,
  "umbralMinimo": 5,
  "fechaCreacion": "2024-01-01T12:00:00",
  "fechaActualizacion": "2024-01-02T09:00:00"
}
```

Dónde mirar el código
---------------------


- Controladores: [InventarioController](src/main/java/com/smartlogix/inventario/controller/InventarioController.java#L18)
- Servicios: [InventarioService](src/main/java/com/smartlogix/inventario/service/InventarioService.java#L1)
- Repositorios: [src/main/java](src/main/java/com/smartlogix/inventario/repository)
- DTOs: [src/main/java/com/smartlogix/inventario/dto](src/main/java/com/smartlogix/inventario/dto)
- Configuración: [src/main/resources/application.properties](src/main/resources/application.properties#L1)
