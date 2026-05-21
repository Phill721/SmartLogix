# Guía de Integración - Microservicio Pedidos

## Checklist de Implementación

### ✅ Completado

- [x] **Entidades JPA**: Pedido, ItemPedido, Carrito, CarritoItem, HistorialEstadoPedido
- [x] **Modelos de negocio**: EstadoPedido, TipoEventoPedido
- [x] **DTOs**: Para request/response de toda la API
- [x] **Repositories**: PedidoRepository, CarritoRepository, HistorialEstadoPedidoRepository
- [x] **Servicios**: 
  - CarritoService (agregar, remover, vaciar, actualizar)
  - PedidoService (crear, confirmar, cancelar, listar)
- [x] **Controladores REST**: 
  - PedidoController (CRUD de pedidos)
  - CarritoController (CRUD de carrito)
- [x] **Configuración**:
  - SecurityConfig (JWT y autenticación)
  - KafkaProducerConfig (productores)
  - GrpcConfig (canal gRPC)
  - CircuitBreakerConfig (Resilience4J)
  - JwtUtil (utilidades JWT)
- [x] **Eventos Kafka**:
  - PedidoCreadoEvent
  - PedidoCanceladoEvent
  - Productor y Consumidor
- [x] **Cliente gRPC**: InventarioGrpcClient (validar, reservar, liberar stock)
- [x] **Manejo de excepciones**: GlobalExceptionHandler y excepciones personalizadas
- [x] **Mapper**: PedidoMapper (conversión de entidades a DTOs)
- [x] **Proto file**: inventario.proto (definiciones gRPC)
- [x] **Documentación**: README.md y este archivo

## Pasos para Compilar

1. **Navegar al directorio del proyecto**:
```bash
cd d:\SmartLogix-2\Pedidos
```

2. **Compilar archivos Proto (opcional, automático con Maven)**:
```bash
mvn protobuf:compile
```

3. **Compilar el proyecto**:
```bash
mvn clean compile
```

4. **Instalar dependencias y crear JAR**:
```bash
mvn clean package
```

## Pasos para Ejecutar

1. **Asegurarse que están corriendo**:
   - MySQL en puerto 3306
   - Kafka en puerto 9092
   - Inventario gRPC en puerto 9090 (cuando esté listo)

2. **Ejecutar la aplicación**:
```bash
mvn spring-boot:run
```

O con Java directamente:
```bash
java -jar target/servicio-pedidos-0.0.1-SNAPSHOT.jar
```

3. **Verificar que esté funcionando**:
```bash
curl http://localhost:8082/actuator/health
```

## Integración con BFF

Cuando el BFF de usuarios-productos esté listo, agregar los siguientes endpoints:

### En el BFF (application.properties):
```properties
pedidos.url=http://localhost:8082
```

### En ProductosBffController o nuevo CarritoBffController:
```java
@PostMapping("/carrito/agregar")
public ResponseEntity<CarritoResponseDTO> agregarAlCarrito(
    @RequestBody AgregarAlCarritoRequestDTO request,
    @RequestHeader("Authorization") String token
) {
    return carritoClient.agregarAlCarrito(token, request);
}

@PostMapping("/pedidos")
public ResponseEntity<PedidoResponseDTO> crearPedido(
    @RequestBody CrearPedidoRequestDTO request,
    @RequestHeader("Authorization") String token
) {
    return pedidosClient.crearPedido(token, request);
}
```

## Notas Importantes

### Flujo de Creación de Pedido

1. **Cliente agrega items al carrito** vía `/api/carrito/agregar`
2. **Cliente llama a crear pedido** vía `POST /api/pedidos`
3. **PedidoService valida stock** con gRPC a Inventario
4. **Si hay stock**, crea pedido en estado PENDIENTE y publica evento `pedido-creado`
5. **Cliente confirma pedido** vía `POST /api/pedidos/{id}/confirmar`
6. **PedidoService reserva stock** vía gRPC a Inventario
7. **Si reserva exitosa**, pedido pasa a CONFIRMADO y publica `stock-reservado`
8. **Inventario confirma** la reserva y publica evento `stock-reservado`

### Flujo de Cancelación

1. **Cliente cancela pedido** vía `POST /api/pedidos/{id}/cancelar`
2. **PedidoService publica evento** `pedido-cancelado`
3. **Inventario escucha el evento** y libera el stock
4. **Inventario publica** evento `stock-liberado`
5. **Pedidos confirma** la cancelación (estado CANCELADO)

### Circuit Breaker

- **Abierto**: 50% fallos en últimas 10 llamadas
- **Espera**: 10 segundos antes de intentar Half-Open
- **Half-Open**: Permite 3 llamadas de prueba
- **Retry**: Máximo 3 intentos automáticos

## Próximos Pasos

### Fase 2: BFF
- [ ] Crear BFF para pedidos-inventario
- [ ] Exponer endpoints de carrito y pedidos
- [ ] Autenticación centralizada

### Fase 3: Mejoras
- [ ] Notificaciones por email
- [ ] Reportes de ventas
- [ ] Integración con pagos
- [ ] Historiales de usuario
- [ ] Cache de productos populares

## Troubleshooting

### Error: "gRPC connection refused"
**Solución**: Verificar que Inventario esté corriendo en puerto 9090
```bash
# Ver puertos en uso
netstat -ano | findstr 9090
```

### Error: "Circuit breaker is open"
**Solución**: Esperar 10 segundos o reiniciar el servicio

### Error: "Stock insuficiente"
**Solución**: Ingresar stock en Inventario primero

### Error: "JWT token expired"
**Solución**: Obtener nuevo token desde Usuarios `/api/usuarios/login`

## Testing

### JSON de ejemplo para crear y autenticar un usuario

#### 1) Crear usuario en Usuarios
Endpoint:
```bash
POST http://localhost:8081/api/usuarios/register
```

Body:
```json
{
  "nombre": "cliente_demo",
  "email": "cliente.demo@smartlogix.local",
  "contrasena": "Cliente123*",
  "rol": "USUARIO"
}
```

#### 2) Autenticar usuario en Usuarios
Endpoint:
```bash
POST http://localhost:8081/api/usuarios/login
```

Body:
```json
{
  "nombre": "cliente_demo",
  "contrasena": "Cliente123*"
}
```

Respuesta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "nombre": "cliente_demo",
  "rol": "USUARIO",
  "permiso": "VISTA_TIENDA",
  "permisos": ["VISTA_TIENDA"]
}
```

### Paso a paso para probar completo el micro de Pedidos

1. Levantar los servicios requeridos:
   - MySQL en `3306`
   - Kafka en `9092`
   - Inventario gRPC en `9090`
   - Usuarios en `8081`
   - Pedidos en `8082`

2. Crear el usuario de prueba con el JSON anterior.

3. Ejecutar el login y copiar el `token` devuelto.

4. Usar ese token en el header:
```bash
Authorization: Bearer {token}
```

5. Agregar productos al carrito:
```bash
curl -X POST http://localhost:8082/api/carrito/agregar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD001",
    "nombreProducto": "Laptop Dell",
    "cantidad": 1,
    "precioUnitario": 999.99
  }'
```

6. Crear el pedido:
```bash
curl -X POST http://localhost:8082/api/pedidos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "sku": "PROD001",
        "nombreProducto": "Laptop Dell",
        "cantidad": 1,
        "precioUnitario": 999.99
      }
    ]
  }'
```

7. Confirmar el pedido usando el `id` devuelto:
```bash
curl -X POST http://localhost:8082/api/pedidos/1/confirmar \
  -H "Authorization: Bearer {token}"
```

8. Consultar el detalle o el listado del usuario:
```bash
curl http://localhost:8082/api/pedidos/1 \
  -H "Authorization: Bearer {token}"
```

9. Si quieres probar el flujo inverso, cancelar el pedido:
```bash
curl -X POST http://localhost:8082/api/pedidos/1/cancelar \
  -H "Authorization: Bearer {token}"
```

### Crear Token JWT (desde Usuarios)
```bash
curl -X POST http://localhost:8081/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "admin",
    "contrasena": "Admin123*"
  }'
```

### Crear Pedido
```bash
curl -X POST http://localhost:8082/api/pedidos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "sku": "TEST001",
      "nombreProducto": "Producto Test",
      "cantidad": 1,
      "precioUnitario": 100.00
    }]
  }'
```

### Cambiar el estado de un pedido

En este microservicio no existe un `PUT` para cambiar el estado del pedido. Los cambios de estado se hacen con `POST`:

#### Confirmar pedido
```bash
curl -X POST http://localhost:8082/api/pedidos/{pedidoId}/confirmar \
  -H "Authorization: Bearer {token}"
```

#### Cancelar pedido
```bash
curl -X POST http://localhost:8082/api/pedidos/{pedidoId}/cancelar \
  -H "Authorization: Bearer {token}"
```

Pasos:
1. Crear el pedido con `POST /api/pedidos`.
2. Copiar el `id` devuelto en la respuesta.
3. Ejecutar `POST /api/pedidos/{pedidoId}/confirmar` o `POST /api/pedidos/{pedidoId}/cancelar` según el flujo que quieras probar.
4. Consultar el pedido con `GET /api/pedidos/{pedidoId}` para validar el nuevo estado.

### Endpoint PUT del carrito

El único `PUT` relevante en este microservicio es para cambiar la cantidad de un item del carrito:

```bash
curl -X PUT "http://localhost:8082/api/carrito/items/{itemId}?cantidad=3" \
  -H "Authorization: Bearer {token}"
```

Este endpoint no recibe JSON en el body. La cantidad se envía como query param `cantidad`.

Pasos:
1. Agregar un producto al carrito con `POST /api/carrito/agregar`.
2. Consultar el carrito con `GET /api/carrito` para obtener el `itemId`.
3. Ejecutar el `PUT /api/carrito/items/{itemId}?cantidad=3`.
4. Volver a consultar el carrito para verificar que la cantidad y el subtotal cambiaron.

## Contacto y Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
