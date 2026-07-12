# 📋 Documentación de Arquitectura - SmartLogix

## 📌 Tabla de Contenidos
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Patrones de Arquitectura](#patrones-de-arquitectura)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Tecnologías y Stack](#tecnologías-y-stack)
6. [Estructura de Directorios](#estructura-de-directorios)
7. [Referencias de Implementación](#referencias-de-implementación)

---

## 🏪 Descripción del Proyecto

**SmartLogix** es una **plataforma web de tienda virtual (e-commerce)** moderna y escalable construida con arquitectura de **microservicios**. 

### Propósito
Proporcionar un sistema completo de gestión de ordenes, inventario, productos y usuarios para una tienda virtual, permitiendo que múltiples servicios trabajen de forma independiente pero coordinada.

### Características Principales
- ✅ Gestión de usuarios con autenticación JWT
- ✅ Catálogo de productos con caché Redis
- ✅ Carrito de compras persistente
- ✅ Sistema de pedidos con estados
- ✅ Gestión de inventario en tiempo real
- ✅ Comunicación asincrónica entre servicios vía Kafka
- ✅ BFF (Backend for Frontend) como puerta de entrada
- ✅ Frontend responsivo en React con Vite

---

## 🏗️ Arquitectura General

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│              (Front-SmartLogix/smartLogix-front/)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  BFF (Backend for Frontend)                  │
│                     (bff/ - Puerto 8080)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │ Usuarios │    │ Productos│    │ Pedidos  │
   │Service  │    │ Service  │    │ Service  │
   │(8081)   │    │ (8084)   │    │ (8087)   │
   └────┬────┘    └────┬─────┘    └────┬─────┘
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │ MySQL   │    │ Redis    │    │ MySQL    │
   │Usuarios │    │ Caché    │    │ Pedidos  │
   └─────────┘    └──────────┘    └──────────┘
   
        Inventario Service (8083)
               (MySQL)
                  ▲
                  │
              ┌───┴────┐
              │  Kafka │
              │ Topics │
              └────────┘
```

### Microservicios

| Servicio | Puerto | Base de Datos | Responsabilidad |
|----------|--------|---------------|-----------------|
| **Usuarios** | 8081 | MySQL (3306) | Gestión de usuarios, autenticación JWT |
| **Productos** | 8084 | MySQL + Redis (6379) | Catálogo de productos con caché |
| **Pedidos** | 8087 | MySQL (3308) | Gestión de ordenes, carrito |
| **Inventario** | 8083 | MySQL (3309) | Stock y reservas |
| **BFF** | 8080 | - | Orquestación de servicios |

---

## 🎯 Patrones de Arquitectura

### 1. **Event-Driven Architecture (Arquitectura Impulsada por Eventos)**

**Descripción:** Los servicios se comunican a través de eventos asincronos en lugar de llamadas HTTP directas, permitiendo baja acoplamiento.

**Implementación:**
- **Topic: `pedido-creado`** → Pedidos publica cuando se crea un pedido
- **Topic: `stock-reservado`** → Inventario responde confirmando la reserva
- **Topic: `stock-liberado`** → Inventario libera stock si hay cancelación
- **Topic: `pedido-cancelado`** → Pedidos publica cancelaciones

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaProducer.java](Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaProducer.java) - Productor de eventos
- [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java](Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java) - Consumidor de eventos (líneas 25-40)
- [Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java](Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java) - Escucha eventos de pedidos
- [docker-compose.yml](docker-compose.yml) - Configuración Kafka (líneas 117-135)

**Flujo de Ejemplo:**
```
1. Usuario crea pedido → Pedidos guardan en BD
2. PedidoService.crearPedido() publica PedidoCreadoEvent
3. Kafka envía a topic "pedido-creado"
4. InventarioConsumer.listenPedidoCreado() recibe evento
5. Inventario reserva stock y publica "stock-reservado"
6. PedidoKafkaConsumer.listenStockReservado() cambia estado a CONFIRMADO
```

### 2. **Microservices Architecture (Arquitectura de Microservicios)**

**Descripción:** Cada servicio es independiente, con su propia BD y responsabilidad específica.

**Beneficios:**
- ✅ Escalabilidad independiente
- ✅ Despliegue independiente
- ✅ Fallos aislados
- ✅ Equipos autónomos

**Servicios:**
- [Usuarios/](Usuarios/) - Gestión de usuarios
- [Productos/](Productos/) - Gestión de productos
- [Pedidos/](Pedidos/) - Gestión de ordenes
- [Inventario/](Inventario/) - Gestión de stock

### 3. **BFF (Backend for Frontend) Pattern**

**Descripción:** Un gateway único que actúa como intermediario entre frontend y microservicios.

**Archivo:** [bff/src/main/java/com/smartlogix/bff/](bff/src/main/java/com/smartlogix/bff/)

**Ventajas:**
- ✅ Un único punto de entrada
- ✅ Gestión centralizada de CORS y seguridad
- ✅ Composición de respuestas de múltiples servicios
- ✅ Rate limiting y throttling centralizado

### 4. **Repository Pattern (Patrón Repositorio)**

**Descripción:** Abstrae el acceso a datos, separando la lógica de negocio del acceso a BD.

**Implementación:**
```java
// Pedidos/src/main/java/com/smartlogix/pedidos/repository/PedidoRepository.java
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioId(Long usuarioId);
}
```

**Archivos con este patrón:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/repository/](Pedidos/src/main/java/com/smartlogix/pedidos/repository/)
- [Inventario/src/main/java/com/smartlogix/inventario/repository/](Inventario/src/main/java/com/smartlogix/inventario/repository/)
- [Productos/src/main/java/com/smartlogix/productos/repository/](Productos/src/main/java/com/smartlogix/productos/repository/)
- [Usuarios/src/main/java/com/smartlogix/usuarios/repository/](Usuarios/src/main/java/com/smartlogix/usuarios/repository/)

### 5. **Mapper/DTO Pattern (Patrón Mapeador)**

**Descripción:** Convierte entre entidades JPA y DTOs para API REST, evitando exponer la BD.

**Implementación:**
```java
// Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java
@Component
public class PedidoMapper {
    public Pedido toPedido(Carrito carrito) { ... }
    public PedidoResponseDTO toPedidoResponseDTO(Pedido pedido) { ... }
}
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java](Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java)
- [Pedidos/src/main/java/com/smartlogix/pedidos/dto/](Pedidos/src/main/java/com/smartlogix/pedidos/dto/) - DTOs

### 6. **Service Layer Pattern (Patrón Capa de Servicios)**

**Descripción:** Encapsula la lógica de negocio en servicios reutilizables.

**Implementación:**
```java
// Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java
@Service
@Transactional
public class PedidoService {
    public PedidoResponseDTO crearPedido(Long usuarioId, CrearPedidoRequestDTO request) { ... }
}
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java](Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java) - Línea 45: `crearPedido()`
- [Productos/src/main/java/com/smartlogix/productos/service/](Productos/src/main/java/com/smartlogix/productos/service/)
- [Inventario/src/main/java/com/smartlogix/inventario/service/](Inventario/src/main/java/com/smartlogix/inventario/service/)

### 7. **Circuit Breaker Pattern (Patrón Disyuntor)**

**Descripción:** Previene cascadas de fallos evitando llamadas a servicios que están caídos.

**Implementación con Resilience4J:**
```java
// Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java (línea 92)
@CircuitBreaker(name = "inventario", fallbackMethod = "confirmarPedidoFallback")
@Retry(name = "inventario", fallbackMethod = "confirmarPedidoFallback")
public PedidoResponseDTO confirmarPedido(Long pedidoId, Long usuarioId) { ... }
```

**Configuración:**
- [Pedidos/src/main/resources/application.properties](Pedidos/src/main/resources/application.properties) - Líneas 42-46

### 8. **Saga Pattern (Patrón Saga)**

**Descripción:** Orquesta transacciones distribuidas entre múltiples servicios.

**Implementación:**
```
Pedido Creado → Inventario Reserva Stock → Pedido Confirmado
                      ↓ (Si falla)
                  Pedido Cancelado
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java](Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java) - Línea 25
- [Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java](Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java)

---

## 🎨 Patrones de Diseño

### 1. **Singleton Pattern**

**Descripción:** Una única instancia de una clase en toda la aplicación.

**Implementación:**
```java
// Todos los @Component y @Service son singletons por defecto en Spring
@Service
@RequiredArgsConstructor
public class PedidoService { ... }
```

**Uso en el proyecto:**
- Todos los servicios: `*Service.java`
- Todos los repositorios: `*Repository.java`
- Configuración: `*Config.java`

### 2. **Factory Pattern (Patrón Fábrica)**

**Descripción:** Crea objetos sin exponer la lógica de creación.

**Implementación:**
```java
// Mapper actúa como fábrica de DTOs
public PedidoResponseDTO toPedidoResponseDTO(Pedido pedido) {
    return PedidoResponseDTO.builder()
        .id(pedido.getId())
        .estado(pedido.getEstado())
        .total(pedido.getTotal())
        .build();
}
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java](Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java)
- Cualquier archivo con `builder()` pattern (Lombok)

### 3. **Adapter Pattern (Patrón Adaptador)**

**Descripción:** Permite que interfaces incompatibles trabajen juntas.

**Implementación:**
```java
// KafkaTemplate actúa como adaptador entre Spring y Kafka
public class PedidoKafkaProducer {
    private final KafkaTemplate<String, PedidoCreadoEvent> kafkaTemplate;
    public void publicarPedidoCreado(PedidoCreadoEvent event) {
        kafkaTemplate.send("pedido-creado", event.getPedidoId().toString(), event);
    }
}
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaProducer.java](Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaProducer.java)
- [Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioKafkaProducer.java](Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioKafkaProducer.java)

### 4. **Observer Pattern (Patrón Observador)**

**Descripción:** Define relaciones uno-a-muchos donde objetos observan cambios.

**Implementación:**
Kafka implementa el patrón observer con consumidores escuchando tópicos:
```java
@KafkaListener(topics = "stock-reservado", groupId = "grupo-pedidos")
public void listenStockReservado(String payload) { ... }
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java](Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java) - Línea 25
- [Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java](Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java) - Línea 25

### 5. **Dependency Injection Pattern (Patrón Inyección de Dependencias)**

**Descripción:** Las dependencias se inyectan en lugar de ser creadas internamente.

**Implementación con Lombok @RequiredArgsConstructor:**
```java
@Service
@RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidoRepository;     // Inyectado
    private final PedidoKafkaProducer kafkaProducer;    // Inyectado
    private final PedidoMapper mapper;                   // Inyectado
}
```

**Beneficios:**
- ✅ Más fácil de testear (mock de dependencias)
- ✅ Bajo acoplamiento
- ✅ Reutilización de código

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/config/KafkaProducerConfig.java](Pedidos/src/main/java/com/smartlogix/pedidos/config/KafkaProducerConfig.java) - Configuración de inyección

### 6. **Strategy Pattern (Patrón Estrategia)**

**Descripción:** Define una familia de algoritmos encapsulados.

**Implementación:**
```java
// Diferentes estrategias de deserialización en Kafka
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
```

**Archivos:**
- Cualquier clase que use enums de estados: `EstadoPedido.java`

### 7. **Builder Pattern (Patrón Constructor)**

**Descripción:** Construcción paso a paso de objetos complejos.

**Implementación con Lombok:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCreadoEvent {
    private Long pedidoId;
    private Long usuarioId;
    // ...
}

// Uso:
PedidoCreadoEvent event = PedidoCreadoEvent.builder()
    .pedidoId(123L)
    .usuarioId(456L)
    .build();
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/event/PedidoCreadoEvent.java](Pedidos/src/main/java/com/smartlogix/pedidos/event/PedidoCreadoEvent.java)
- [Pedidos/src/main/java/com/smartlogix/pedidos/entity/Pedido.java](Pedidos/src/main/java/com/smartlogix/pedidos/entity/Pedido.java)

### 8. **Decorator Pattern (Patrón Decorador)**

**Descripción:** Añade responsabilidades dinámicamente a objetos.

**Implementación:**
```java
// @Transactional decora el método añadiendo transaccionalidad
@Service
@Transactional
public class PedidoService {
    public PedidoResponseDTO crearPedido(...) { ... }  // Automáticamente transaccional
}
```

**Archivos:**
- [Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java](Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java) - Línea 40

---

## 🛠️ Tecnologías y Stack

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Java** | 17 | Lenguaje de programación |
| **Spring Boot** | 4.0.5 / 3.4.1 | Framework principal |
| **Spring Data JPA** | - | ORM y acceso a datos |
| **Spring Kafka** | - | Mensajería |
| **Resilience4J** | - | Circuit Breaker y Retry |
| **JWT (jjwt)** | - | Autenticación |
| **MySQL** | 8 | Base de datos relacional |
| **Redis** | - | Cache distribuida |
| **gRPC** | - | RPC de alta performance |
| **Protocol Buffers** | - | Serialización gRPC |
| **Maven** | - | Build tool |
| **Lombok** | - | Reducir boilerplate |

### Infraestructura
| Herramienta | Uso |
|------------|-----|
| **Docker** | Containerización |
| **Docker Compose** | Orquestación local |
| **Kafka + Zookeeper** | Event streaming |
| **Kafdrop** | UI para Kafka |
| **phpMyAdmin** | Gestión de MySQL |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18+ | Framework UI |
| **Vite** | - | Build tool |
| **Tailwind CSS** | - | Estilos |
| **Vitest** | - | Testing |
| **ESLint** | - | Linting |

---

## 📁 Estructura de Directorios

```
SmartLogix/
├── Usuarios/                    # Microservicio de usuarios
│   ├── src/main/java/com/smartlogix/usuarios/
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Lógica de negocio
│   │   ├── entity/             # Modelos JPA
│   │   ├── repository/         # Acceso a datos
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── security/           # JWT y autenticación
│   │   └── config/             # Configuraciones
│   ├── pom.xml                 # Dependencias Maven
│   ├── Dockerfile              # Imagen Docker
│   └── README.md
│
├── Productos/                   # Microservicio de productos
│   ├── src/main/java/com/smartlogix/productos/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── dto/
│   │   ├── cache/              # Estrategia de caché
│   │   └── config/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
│
├── Pedidos/                     # Microservicio de pedidos
│   ├── src/main/java/com/smartlogix/pedidos/
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Lógica de pedidos
│   │   ├── entity/             # Pedido, Carrito, Item
│   │   ├── repository/         # Acceso a datos
│   │   ├── dto/                # DTOs
│   │   ├── kafka/              # Productor/Consumidor
│   │   ├── event/              # Eventos (PedidoCreadoEvent, etc)
│   │   ├── mapper/             # Mapeo Entidad <-> DTO
│   │   ├── config/             # KafkaProducerConfig, SecurityConfig
│   │   ├── exception/          # Excepciones personalizadas
│   │   └── model/              # EstadoPedido enum
│   ├── pom.xml
│   ├── Dockerfile
│   ├── INTEGRATION_GUIDE.md
│   └── README.md
│
├── Inventario/                  # Microservicio de inventario
│   ├── src/main/java/com/smartlogix/inventario/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/             # Stock, Producto
│   │   ├── repository/
│   │   ├── dto/
│   │   ├── kafka/              # Consumidor/Productor
│   │   ├── event/              # Eventos
│   │   ├── mapper/
│   │   ├── grpc/               # Servicios gRPC
│   │   └── config/
│   ├── src/main/proto/         # Definiciones Protocol Buffers
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
│
├── bff/                         # Backend for Frontend
│   ├── src/main/java/com/smartlogix/bff/
│   │   ├── controller/         # Endpoints unified
│   │   ├── service/            # Orquestación
│   │   ├── client/             # Clientes REST a otros servicios
│   │   └── config/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
│
├── Front-SmartLogix/            # Frontend
│   └── smartLogix-front/
│       ├── src/
│       │   ├── components/     # Componentes React
│       │   ├── pages/          # Páginas
│       │   ├── services/       # Llamadas a API
│       │   ├── context/        # Context API
│       │   ├── hooks/          # Custom hooks
│       │   ├── utils/          # Utilidades
│       │   ├── theme/          # Temas Tailwind
│       │   └── __tests__/      # Tests
│       ├── package.json
│       ├── vite.config.js
│       ├── vitest.config.js
│       └── Dockerfile
│
├── docker-compose.yml          # Orquestación de servicios
├── ARQUITECTURA_PROYECTO.md    # Este archivo
├── HU-CA.md                    # Historias de usuario
└── README.md                   # README principal
```

---

## 🔍 Referencias de Implementación

### Event-Driven Communication
**Flujo de creación de pedido:**
```
1. Frontend → POST /api/pedidos
2. BFF (8080) → Pedidos Service (8087)
3. PedidoController.crearPedido() [Pedidos/src/main/java/com/smartlogix/pedidos/controller/PedidoController.java:50]
4. PedidoService.crearPedido() [Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java:45]
5. Mapper convierte Carrito a Pedido [Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java:13]
6. Guarda en BD [pedidoRepository.save()]
7. PedidoKafkaProducer.publicarPedidoCreado() [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaProducer.java:19]
8. Kafka publica a topic "pedido-creado"
9. InventarioConsumer escucha [Inventario/src/main/java/com/smartlogix/inventario/kafka/InventarioConsumer.java:25]
10. Reserva stock → publica "stock-reservado"
11. PedidoKafkaConsumer escucha [Pedidos/src/main/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumer.java:25]
12. Cambia estado de pedido a CONFIRMADO
```

### Security & JWT
**Autenticación:**
- Tokens creados en: [Pedidos/src/main/java/com/smartlogix/pedidos/config/JwtUtil.java](Pedidos/src/main/java/com/smartlogix/pedidos/config/JwtUtil.java)
- Validación en: [Pedidos/src/main/java/com/smartlogix/pedidos/config/SecurityConfig.java:45](Pedidos/src/main/java/com/smartlogix/pedidos/config/SecurityConfig.java)
- Configuración en: [Pedidos/src/main/resources/application.properties:35-36](Pedidos/src/main/resources/application.properties)

### Caching Strategy
**Redis Cache en Productos:**
- Configuración: [Productos/src/main/java/com/smartlogix/productos/config/](Productos/src/main/java/com/smartlogix/productos/config/)
- Uso: [Productos/src/main/java/com/smartlogix/productos/service/ProductoService.java](Productos/src/main/java/com/smartlogix/productos/service/ProductoService.java)
- TTL configurado en: [Productos/pom.xml](Productos/pom.xml)

### Data Isolation Fix
**Problema:** Pedidos acumulaban items de órdenes previas
**Solución implementada:**
- Mapper: [Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java:15-20](Pedidos/src/main/java/com/smartlogix/pedidos/mapper/PedidoMapper.java)
  - Usa `ArrayList::new` para crear nueva lista
- Service: [Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java:73-74](Pedidos/src/main/java/com/smartlogix/pedidos/service/PedidoService.java)
  - Llama `carrito.vaciar()` después de crear pedido

### Testing
**Unit Tests:**
- [Pedidos/src/test/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumerTest.java](Pedidos/src/test/java/com/smartlogix/pedidos/kafka/PedidoKafkaConsumerTest.java)
- MockMvc para endpoints: [Pedidos/src/test/java/com/smartlogix/pedidos/controller/](Pedidos/src/test/java/com/smartlogix/pedidos/controller/)

**Test Coverage:**
- Reportes: [Pedidos/target/site/jacoco/](Pedidos/target/site/jacoco/)
- Configuración: [Pedidos/pom.xml](Pedidos/pom.xml)

---

## 📊 Flujo de Datos Completo

### Compra de Producto (Happy Path)

```
USUARIO
   │
   ├─→ [1] Visualiza productos
   │      GET /api/productos
   │      └─→ BFF → Productos Service
   │          └─→ Redis Cache (si existe)
   │          └─→ MySQL (si no existe)
   │
   ├─→ [2] Agrega al carrito
   │      POST /api/carrito
   │      └─→ BFF → Pedidos Service
   │          └─→ Crea/actualiza Carrito en MySQL
   │
   ├─→ [3] Crea pedido
   │      POST /api/pedidos
   │      └─→ BFF → Pedidos Service
   │          ├─→ Crea Pedido en MySQL (PENDIENTE)
   │          ├─→ Publica evento "pedido-creado" a Kafka
   │          │   └─→ InventarioConsumer recibe
   │          │       ├─→ Reserva stock en MySQL
   │          │       └─→ Publica "stock-reservado" a Kafka
   │          │
   │          └─→ PedidoKafkaConsumer recibe "stock-reservado"
   │              └─→ Actualiza Pedido a CONFIRMADO en MySQL
   │
   └─→ [4] Ve pedido confirmado
          GET /api/pedidos/{pedidoId}
          └─→ BFF → Pedidos Service
              └─→ Retorna Pedido con estado CONFIRMADO
```

---

## ⚙️ Configuración Crítica

### Kafka Topics [docker-compose.yml:125]
```yaml
kafka:
  environment:
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
```

### Database Isolation [application.properties]
```properties
# Pedidos
spring.datasource.url=jdbc:mysql://slbd-pedidos:3306/smartlogix_pedidos

# Inventario
spring.datasource.url=jdbc:mysql://slbd-inventario:3306/smartlogix_inventario

# Productos
spring.datasource.url=jdbc:mysql://slbd-productos:3306/smartlogix_productos

# Usuarios
spring.datasource.url=jdbc:mysql://slbd-usuarios:3306/smartlogix_usuarios
```

### Circuit Breaker Thresholds [Pedidos/application.properties:42-46]
```properties
resilience4j.circuitbreaker.instances.inventario.sliding-window-size=10
resilience4j.circuitbreaker.instances.inventario.failure-rate-threshold=50
resilience4j.circuitbreaker.instances.inventario.wait-duration-in-open-state=10s
resilience4j.circuitbreaker.instances.inventario.permitted-number-of-calls-in-half-open-state=3
```

---

## 🚀 Deployment

### Docker Compose
```bash
docker-compose up -d
```

Inicia:
- 4 instancias MySQL (usuarios, productos, pedidos, inventario)
- Redis
- Kafka + Zookeeper
- Kafdrop (UI Kafka)
- 4 Microservicios
- BFF
- Frontend

### Acceso a UIs
- Frontend: `http://localhost:5173`
- BFF: `http://localhost:8080`
- Kafdrop: `http://localhost:9000`
- phpMyAdmin: `http://localhost:9091` (usuarios), `http://localhost:9083` (inventario), etc.

---

## 📚 Referencias Adicionales

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Kafka](https://spring.io/projects/spring-kafka)
- [Resilience4J](https://resilience4j.readme.io/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [Docker Documentation](https://docs.docker.com/)
- [Design Patterns in Java](https://refactoring.guru/design-patterns)

---

**Última actualización:** 11 de Julio de 2026  
**Versión:** 1.0  
**Autor:** SmartLogix Architecture Team
