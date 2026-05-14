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

## Contacto y Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
