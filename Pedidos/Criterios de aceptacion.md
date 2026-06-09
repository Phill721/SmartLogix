🛒 Módulo Pedidos
HU-ORD-01  Crear pedido
"Como usuario autenticado, quiero crear un nuevo pedido seleccionando productos y cantidades, para gestionar mis compras a través de la plataforma."
RF: RF-ORD-01   RNF: RNF-PED-01, RNF-PED-02
N°	Criterio de Aceptación
CA-01	El pedido debe incluir al menos un producto con cantidad mayor a cero.
CA-02	El sistema debe validar disponibilidad de stock consultando Inventory Service vía gRPC antes de confirmar.
CA-03	Al crear el pedido, el estado inicial debe ser 'PENDIENTE'.
CA-04	El sistema debe publicar el evento Kafka 'PedidoCreado' para notificar a otros servicios.
CA-05	El BFF debe optimizar la respuesta para el cliente con solo los datos necesarios (RNF-PED-02).

HU-ORD-02  Validación de stock al crear pedido
"Como sistema, quiero validar la disponibilidad de stock en el Inventory Service antes de confirmar un pedido, para evitar crear pedidos sin respaldo de inventario."
RF: RF-ORD-02   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	La validación debe realizarse vía gRPC con Circuit Breaker activo (Resilience4J).
CA-02	Si el Circuit Breaker está abierto, el pedido debe ser rechazado con mensaje informativo.
CA-03	El timeout máximo para la llamada gRPC es de 3 segundos (TimeLimiter).
CA-04	Si el stock es insuficiente, el pedido debe rechazarse con estado 'RECHAZADO' y motivo.
CA-05	El sistema debe aplicar Retry automático ante fallos transitorios (máximo 3 intentos).

HU-ORD-03  Gestión de estados del pedido
"Como sistema, quiero gestionar el ciclo de vida de un pedido a través de sus estados (Pendiente → Confirmado → Enviado → Entregado / Rechazado), para mantener trazabilidad completa."
RF: RF-ORD-03   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	Los estados válidos son: PENDIENTE, CONFIRMADO, RECHAZADO, ENVIADO, ENTREGADO, CANCELADO.
CA-02	Las transiciones de estado deben seguir el flujo definido (no se puede ir de ENTREGADO a PENDIENTE).
CA-03	Cada cambio de estado debe registrarse en el historial de trazabilidad con timestamp.
CA-04	El cambio de estado debe publicar el evento Kafka correspondiente (ej. 'PedidoEnviado').
CA-05	Solo un Administrador puede forzar un cambio de estado fuera del flujo normal.

HU-ORD-04  Reserva de stock al confirmar pedido
"Como sistema, quiero solicitar la reserva de stock al Inventory Service al confirmar un pedido, para asegurar los productos mientras se procesa la entrega."
RF: RF-ORD-04   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	La solicitud de reserva debe enviarse vía gRPC al confirmar el pedido.
CA-02	Si la reserva falla, el pedido debe pasar a estado 'RECHAZADO' automáticamente.
CA-03	El Circuit Breaker debe proteger la llamada ante indisponibilidad de Inventario.
CA-04	La reserva confirmada debe quedar registrada en el historial de trazabilidad del pedido.
CA-05	El sistema debe publicar 'PedidoConfirmado' solo tras reserva exitosa.

HU-ORD-05  Cancelación de pedido
"Como usuario autenticado, quiero cancelar un pedido en estado Pendiente o Confirmado, para desistir de una compra cuando sea necesario."
RF: RF-ORD-05   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	Solo pueden cancelarse pedidos en estado PENDIENTE o CONFIRMADO.
CA-02	Al cancelar, el sistema debe publicar el evento Kafka 'PedidoCancelado'.
CA-03	El microservicio de Inventario debe recibir el evento y liberar el stock reservado.
CA-04	El usuario que cancela debe ser el dueño del pedido o un Administrador.
CA-05	La cancelación debe registrarse en el historial de trazabilidad con motivo opcional.

HU-ORD-06  Liberación de stock al cancelar
"Como sistema, quiero solicitar la liberación del stock reservado al Inventory Service cuando un pedido es cancelado, para restituir la disponibilidad del inventario."
RF: RF-ORD-06   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	La liberación debe dispararse al publicar el evento Kafka 'PedidoCancelado'.
CA-02	El Inventory Service debe confirmar la liberación mediante evento de respuesta.
CA-03	Si la liberación falla, Kafka debe reintentar la entrega del mensaje (retención 7 días).
CA-04	El estado del pedido debe actualizarse a CANCELADO solo tras confirmar la liberación.
CA-05	La trazabilidad del pedido debe reflejar la liberación de stock.

HU-ORD-07  Consulta de pedidos por usuario
"Como usuario autenticado, quiero consultar el listado de mis pedidos realizados, para hacer seguimiento del estado de mis compras."
RF: RF-ORD-07   RNF: RNF-PED-02
N°	Criterio de Aceptación
CA-01	Un usuario solo puede ver sus propios pedidos; un Administrador puede ver todos.
CA-02	El listado debe soportar filtrado por estado y rango de fechas.
CA-03	La respuesta debe incluir: ID pedido, fecha, estado actual y total.
CA-04	El BFF debe optimizar la respuesta omitiendo campos no relevantes para el cliente.
CA-05	El listado debe soportar paginación (máximo 20 pedidos por página).

HU-ORD-08  Detalle del pedido
"Como usuario autenticado, quiero ver el detalle completo de un pedido, para revisar productos, cantidades, precios y estado actual."
RF: RF-ORD-08   RNF: RNF-PED-01
N°	Criterio de Aceptación
CA-01	El detalle debe incluir: productos, cantidades, precios unitarios, total y estado.
CA-02	Solo el dueño del pedido o un Administrador pueden ver el detalle.
CA-03	El detalle debe incluir el historial de estados con fechas y transiciones.
CA-04	El sistema debe retornar HTTP 404 si el pedido no existe o no pertenece al usuario.
CA-05	La trazabilidad completa del ciclo de vida debe estar disponible en el detalle (RNF-PED-01).

HU-ORD-09  Trazabilidad del historial de estados
"Como usuario autenticado, quiero visualizar el historial completo de estados de un pedido, para saber en qué etapa se encuentra y qué ocurrió en cada transición."
RF: RF-ORD-09   RNF: RNF-PED-01, RNF-PED-03
N°	Criterio de Aceptación
CA-01	El historial debe registrar cada cambio de estado con: estado anterior, nuevo estado, timestamp y usuario.
CA-02	El historial debe ser de solo lectura (inmutable).
CA-03	Las pruebas unitarias de trazabilidad deben ejecutarse automáticamente en el pipeline CI/CD (RNF-PED-03).
CA-04	El historial debe estar disponible en el detalle del pedido.
CA-05	El sistema debe garantizar que ningún cambio de estado ocurra sin registro en el historial.
