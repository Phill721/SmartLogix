# Microservicio de Pedidos - SmartLogix

## Descripción

Microservicio responsable de la gestión completa del ciclo de vida de pedidos y carritos de compra. Proporciona funcionalidades para:

- **Gestión de Carritos**: agregar, actualizar y remover productos
- **Creación de Pedidos**: con validación de stock mediante gRPC
- **Confirmación de Pedidos**: con reserva de stock
- **Cancelación de Pedidos**: con liberación de stock
- **Trazabilidad**: historial de cambios de estado
- **Integración con Inventario**: vía gRPC
- **Eventos Kafka**: publicación de eventos para notificar a otros servicios

## Tecnologías

- **Spring Boot 4.0.5**
- **Spring Data JPA**
- **MySQL**
- **Apache Kafka**
- **gRPC**
- **Resilience4J** (Circuit Breaker, Retry)
- **Spring Security**
- **Lombok**
- **Maven**

## Puertos y Configuración

- **Puerto HTTP**: 8082
- **Puerto gRPC Inventory**: 9090
- **Kafka Bootstrap**: localhost:9092
- **Base de datos**: smartlogix_pedidos

## Estructura del Proyecto

```
src/
├── main/
│   ├── java/com/smartlogix/pedidos/
│   │   ├── PedidosApplication.java          # Clase principal
│   │   ├── config/                          # Configuración
│   │   │   ├── SecurityConfig.java          # Seguridad y JWT
│   │   │   ├── KafkaProducerConfig.java     # Configuración Kafka
│   │   │   ├── GrpcConfig.java              # Configuración gRPC
│   │   │   ├── CircuitBreakerConfig.java   # Circuit Breaker
│   │   │   └── JwtUtil.java                 # Utilidades JWT
│   │   ├── controller/                      # Controladores REST
│   │   │   ├── PedidoController.java        # CRUD de pedidos
│   │   │   └── CarritoController.java       # CRUD de carritos
│   │   ├── service/                         # Servicios de negocio
│   │   │   ├── PedidoService.java           # Lógica de pedidos
│   │   │   └── CarritoService.java          # Lógica de carritos
│   │   ├── entity/                          # Entidades JPA
│   │   │   ├── Pedido.java
│   │   │   ├── ItemPedido.java
│   │   │   ├── Carrito.java
│   │   │   ├── CarritoItem.java
│   │   │   └── HistorialEstadoPedido.java
│   │   ├── dto/                             # Data Transfer Objects
│   │   │   ├── PedidoResponseDTO.java
│   │   │   ├── CrearPedidoRequestDTO.java
│   │   │   ├── CarritoResponseDTO.java
│   │   │   └── ...
│   │   ├── repository/                      # Acceso a datos
│   │   │   ├── PedidoRepository.java
│   │   │   ├── CarritoRepository.java
│   │   │   └── HistorialEstadoPedidoRepository.java
│   │   ├── exception/                       # Excepciones personalizadas
│   │   │   ├── PedidoNotFoundException.java
│   │   │   ├── StockInsuficienteException.java
│   │   │   ├── CircuitBreakerAbiertoException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── event/                           # Eventos de dominio
│   │   │   ├── PedidoCreadoEvent.java
│   │   │   └── PedidoCanceladoEvent.java
│   │   ├── kafka/                           # Productores/Consumidores
│   │   │   ├── PedidoKafkaProducer.java
│   │   │   └── PedidoKafkaConsumer.java
│   │   ├── grpc/                            # Cliente gRPC
│   │   │   └── InventarioGrpcClient.java
│   │   ├── mapper/                          # Mapeo de entidades
│   │   │   └── PedidoMapper.java
│   │   └── model/                           # Enumeraciones
│   │       ├── EstadoPedido.java
│   │       └── TipoEventoPedido.java
│   ├── proto/                               # Definiciones gRPC
│   │   └── inventario.proto
│   └── resources/
│       └── application.properties            # Configuración
└── test/                                    # Tests
```

## Estados del Pedido

```
PENDIENTE  -->  CONFIRMADO  -->  ENVIADO  -->  ENTREGADO
    |              |
    |              v
    +-->  RECHAZADO

PENDIENTE/CONFIRMADO  -->  CANCELADO
```

## Tópicos Kafka

### Publicados por Pedidos
- **pedido-creado**: Al crear un nuevo pedido
- **pedido-cancelado**: Al cancelar un pedido

### Consumidos por Pedidos
- **stock-reservado**: Confirmación de reserva desde Inventario
- **stock-liberado**: Confirmación de liberación desde Inventario

## API REST

### Gestión de Pedidos

#### Crear Pedido
```bash
POST /api/pedidos
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "sku": "PROD001",
      "nombreProducto": "Laptop",
      "cantidad": 2,
      "precioUnitario": 1000.00
    }
  ]
}
```

#### Confirmar Pedido
```bash
POST /api/pedidos/{pedidoId}/confirmar
Authorization: Bearer {token}
```

#### Cancelar Pedido
```bash
POST /api/pedidos/{pedidoId}/cancelar
Authorization: Bearer {token}
```

#### Obtener Detalle Pedido
```bash
GET /api/pedidos/{pedidoId}
Authorization: Bearer {token}
```

#### Listar Pedidos del Usuario
```bash
GET /api/pedidos?page=0&size=20&estado=CONFIRMADO
Authorization: Bearer {token}
```

### Gestión de Carritos

#### Obtener Carrito
```bash
GET /api/carrito
Authorization: Bearer {token}
```

#### Agregar al Carrito
```bash
POST /api/carrito/agregar
Authorization: Bearer {token}
Content-Type: application/json

{
  "sku": "PROD001",
  "nombreProducto": "Laptop",
  "cantidad": 1,
  "precioUnitario": 1000.00
}
```

#### Remover del Carrito
```bash
DELETE /api/carrito/items/{itemId}
Authorization: Bearer {token}
```

#### Actualizar Cantidad
```bash
PUT /api/carrito/items/{itemId}?cantidad=5
Authorization: Bearer {token}
```

#### Vaciar Carrito
```bash
DELETE /api/carrito/vaciar
Authorization: Bearer {token}
```

## Integración gRPC con Inventario

### Métodos disponibles

1. **ValidarStock**: Valida disponibilidad antes de crear pedido
2. **ReservarStock**: Reserva stock al confirmar pedido
3. **LiberarStock**: Libera stock al cancelar pedido

### Circuit Breaker
- **Sliding Window Size**: 10 llamadas
- **Failure Rate Threshold**: 50%
- **Wait Duration in Open State**: 10 segundos
- **Max Retries**: 3

## Variables de Entorno

```properties
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=12345

# Kafka
KAFKA_BROKER=localhost:9092

# gRPC
GRPC_INVENTORY_HOST=localhost
GRPC_INVENTORY_PORT=9090

# JWT
JWT_SECRET=smartlogix-secret-key-hmac-sha256
JWT_EXPIRATION=900000
```

## Compilación y Ejecución

### Build
```bash
mvn clean package
```

### Run
```bash
mvn spring-boot:run
```

### Proto Compilation
```bash
mvn protobuf:compile
```

## Seguridad

- **Autenticación**: Token JWT en header Authorization
- **CSRF Protection**: Deshabilitado para gRPC
- **Session**: Stateless
- **Validación**: DTOs con anotaciones Jakarta Validation

## Handling de Errores

Todos los errores devuelven una respuesta JSON con:
- `timestamp`: Momento del error
- `error`: Tipo de error
- `message`: Descripción
- `status`: Código HTTP

Ejemplo 404:
```json
{
  "timestamp": "2026-05-14T10:30:00",
  "error": "Pedido no encontrado",
  "message": "No existe pedido con ID: 999",
  "status": 404
}
```

## Testing

Ejecutar tests:
```bash
mvn test
```

## Pasos siguientes

1. Integrar con BFF para exposición de endpoints
2. Implementar notificaciones por email
3. Agregar reportes de pedidos
4. Implementar pagos
