# SmartLogix — Historias de Usuario Frontend
**Plataforma Logística para eCommerce · Desarrollo Full Stack III · 2025**
 
> Documento: HU Frontend + Criterios de Pruebas Unitarias · Versión 1.0
 
---
 
## Tabla de Contenidos
 
- [👤 Módulo Usuarios](#-módulo-usuarios)
  - [HU-FE-USR-01 Formulario de registro](#hu-fe-usr-01-formulario-de-registro-de-usuario)
  - [HU-FE-USR-02 Pantalla de inicio de sesión](#hu-fe-usr-02-pantalla-de-inicio-de-sesión)
  - [HU-FE-USR-03 Perfil y edición de datos](#hu-fe-usr-03-pantalla-de-perfil-y-edición-de-datos)
  - [HU-FE-USR-04 Panel de gestión de usuarios (Admin)](#hu-fe-usr-04-panel-de-gestión-de-usuarios-admin)
- [📦 Módulo Productos](#-módulo-productos)
  - [HU-FE-PRD-01 Vista del catálogo](#hu-fe-prd-01-vista-del-catálogo-de-productos)
  - [HU-FE-PRD-02 Búsqueda por SKU](#hu-fe-prd-02-búsqueda-de-producto-por-sku)
  - [HU-FE-PRD-03 Formulario de edición de producto](#hu-fe-prd-03-formulario-de-edición-de-producto)
  - [HU-FE-PRD-04 Filtro por categoría](#hu-fe-prd-04-filtro-de-productos-por-categoría)
- [🏭 Módulo Inventario](#-módulo-inventario)
  - [HU-FE-INV-01 Panel de consulta de stock](#hu-fe-inv-01-panel-de-consulta-de-stock-disponible)
  - [HU-FE-INV-02 Formulario de ajuste manual](#hu-fe-inv-02-formulario-de-ajuste-manual-de-inventario)
  - [HU-FE-INV-03 Panel de alertas de bajo stock](#hu-fe-inv-03-panel-de-alertas-de-bajo-stock)
  - [HU-FE-INV-04 Historial de movimientos](#hu-fe-inv-04-historial-de-movimientos-de-inventario)
- [🛒 Módulo Pedidos](#-módulo-pedidos)
  - [HU-FE-ORD-01 Formulario de creación de pedido](#hu-fe-ord-01-formulario-de-creación-de-pedido)
  - [HU-FE-ORD-02 Listado de pedidos del usuario](#hu-fe-ord-02-listado-de-pedidos-del-usuario)
  - [HU-FE-ORD-03 Detalle de pedido y trazabilidad](#hu-fe-ord-03-detalle-de-pedido-y-trazabilidad-de-estados)
  - [HU-FE-ORD-04 Cancelación de pedido](#hu-fe-ord-04-cancelación-de-pedido)
  - [HU-FE-ORD-05 Gestión de estados (Admin)](#hu-fe-ord-05-gestión-de-estados-del-pedido-admin)
---
 
## 👤 Módulo Usuarios
 
---
 
### HU-FE-USR-01 Formulario de registro de usuario
 
**RF:** RF-USR-01 · **RNF:** RNF-USR-01, RNF-USR-03
 
> *Como nuevo usuario, quiero completar un formulario de registro con nombre, email y contraseña para crear mi cuenta en SmartLogix.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El formulario muestra campos: nombre, email y contraseña con labels visibles. | Frontend |
| CA-02 | El campo email valida formato correcto en tiempo real (blur/onChange) antes de enviar. | Frontend |
| CA-03 | La contraseña muestra indicador de fortaleza (débil/media/fuerte) mientras el usuario escribe. | Frontend |
| CA-04 | El botón "Registrar" queda deshabilitado mientras los campos obligatorios están vacíos. | Frontend |
| CA-05 | Ante email duplicado, el componente muestra el mensaje de error retornado por la API. | Frontend |
| CA-06 | Al registrarse con éxito, el usuario es redirigido al dashboard con mensaje de bienvenida. | Frontend |
| CA-07 | El endpoint POST /api/users acepta nombre, email y contraseña; retorna 201 con datos del usuario. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-USR-01-01 | Renderiza todos los campos del formulario sin errores. | Unit | Jest / RTL |
| UT-FE-USR-01-02 | Muestra error de validación ante email con formato inválido. | Unit | Jest / RTL |
| UT-FE-USR-01-03 | El botón "Registrar" está deshabilitado cuando el formulario está vacío. | Unit | Jest / RTL |
| UT-FE-USR-01-04 | Muestra mensaje de error de la API cuando el email ya existe. | Unit | Jest / RTL |
| UT-BE-USR-01-01 | POST /api/users retorna 201 con datos correctos. | Unit | JUnit 5 |
| UT-BE-USR-01-02 | POST /api/users retorna 409 si el email ya existe. | Unit | JUnit 5 |
 
---
 
### HU-FE-USR-02 Pantalla de inicio de sesión
 
**RF:** RF-USR-02 · **RNF:** RNF-USR-02, RNF-USR-04
 
> *Como usuario registrado, quiero ingresar mi email y contraseña en un formulario de login para obtener acceso a la plataforma.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El formulario muestra campos email y contraseña con opción de mostrar/ocultar contraseña. | Frontend |
| CA-02 | Tras login exitoso, el token JWT se almacena en memoria/context (no en localStorage) y se redirige al dashboard. | Frontend |
| CA-03 | Tras 3 intentos fallidos, el formulario muestra aviso de bloqueo temporal. | Frontend |
| CA-04 | El indicador de carga (spinner) se muestra mientras se espera la respuesta de la API. | Frontend |
| CA-05 | El enlace "Olvidé mi contraseña" navega a la ruta /recovery. | Frontend |
| CA-06 | POST /api/auth/login retorna token JWT y refreshToken con credenciales válidas. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-USR-02-01 | Renderiza el formulario con campos email, password y botón submit. | Unit | Jest / RTL |
| UT-FE-USR-02-02 | Muestra spinner durante la llamada a la API. | Unit | Jest / RTL |
| UT-FE-USR-02-03 | Muestra mensaje de error con credenciales inválidas. | Unit | Jest / RTL |
| UT-FE-USR-02-04 | Redirige al dashboard tras login exitoso. | Unit | Jest / RTL |
| UT-BE-USR-02-01 | POST /api/auth/login retorna 200 con JWT válido. | Unit | JUnit 5 |
| UT-BE-USR-02-02 | POST /api/auth/login retorna 401 con contraseña incorrecta. | Unit | JUnit 5 |
 
---
 
### HU-FE-USR-03 Pantalla de perfil y edición de datos
 
**RF:** RF-USR-05 · **RNF:** RNF-USR-03
 
> *Como usuario autenticado, quiero ver y editar mi información personal (nombre, email, contraseña) desde una pantalla de perfil.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La pantalla muestra los datos actuales del usuario pre-cargados en los campos. | Frontend |
| CA-02 | El campo contraseña exige ingresar la contraseña actual antes de permitir el cambio. | Frontend |
| CA-03 | Al guardar con éxito se muestra un toast de confirmación y los datos se actualizan en pantalla. | Frontend |
| CA-04 | Si el nuevo email ya está en uso, se muestra el mensaje de error de la API inline. | Frontend |
| CA-05 | PUT /api/users/:id retorna 200 con los datos actualizados; 409 si el email ya existe. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-USR-03-01 | Pre-carga los datos del usuario en los campos del formulario. | Unit | Jest / RTL |
| UT-FE-USR-03-02 | Muestra toast de éxito tras actualización exitosa. | Unit | Jest / RTL |
| UT-FE-USR-03-03 | Muestra error inline cuando el email ya está en uso. | Unit | Jest / RTL |
| UT-BE-USR-03-01 | PUT /api/users/:id actualiza nombre correctamente. | Unit | JUnit 5 |
| UT-BE-USR-03-02 | PUT /api/users/:id retorna 409 si el email está duplicado. | Unit | JUnit 5 |
 
---
 
### HU-FE-USR-04 Panel de gestión de usuarios (Admin)
 
**RF:** RF-USR-03, RF-USR-06 · **RNF:** RNF-USR-02
 
> *Como administrador, quiero ver una lista de todos los usuarios, asignar roles y desactivar cuentas desde un panel centralizado.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La pantalla solo es accesible para usuarios con rol Administrador; redirige con 403 a otros roles. | Frontend |
| CA-02 | La lista muestra: nombre, email, rol actual y estado (activo/inactivo) con paginación de 20 filas. | Frontend |
| CA-03 | El dropdown de rol muestra: Administrador, Operador, Cliente. El cambio se confirma con un modal. | Frontend |
| CA-04 | El botón "Desactivar" muestra modal de confirmación antes de ejecutar la acción. | Frontend |
| CA-05 | Tras desactivar un usuario se actualiza el estado en la fila sin recargar la página. | Frontend |
| CA-06 | PATCH /api/users/:id/role retorna 200; PATCH /api/users/:id/deactivate retorna 200. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-USR-04-01 | Renderiza la tabla de usuarios con datos paginados. | Unit | Jest / RTL |
| UT-FE-USR-04-02 | Muestra modal de confirmación al intentar desactivar un usuario. | Unit | Jest / RTL |
| UT-FE-USR-04-03 | Redirige con mensaje 403 si el usuario no es Administrador. | Unit | Jest / RTL |
| UT-BE-USR-04-01 | PATCH /api/users/:id/role retorna 403 para rol no-admin. | Unit | JUnit 5 |
| UT-BE-USR-04-02 | PATCH /api/users/:id/deactivate invalida todos los tokens activos. | Unit | JUnit 5 |
 
---
 
## 📦 Módulo Productos
 
---
 
### HU-FE-PRD-01 Vista del catálogo de productos
 
**RF:** RF-PRD-01, RF-PRD-03 · **RNF:** RNF-PRO-01, RNF-PRO-02
 
> *Como usuario autenticado, quiero navegar un catálogo visual de productos con nombre, SKU, categoría e imagen para conocer el inventario disponible.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La vista muestra tarjetas con: imagen, nombre, SKU, categoría y stock disponible. | Frontend |
| CA-02 | La paginación muestra máximo 20 productos por página con controles de navegación. | Frontend |
| CA-03 | El skeleton loader se muestra mientras los datos están cargando. | Frontend |
| CA-04 | Si la imagen de un producto no carga, se muestra un placeholder. | Frontend |
| CA-05 | GET /api/products retorna lista paginada; el tiempo de respuesta no supera 500 ms. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-PRD-01-01 | Renderiza lista de tarjetas con datos mockeados. | Unit | Jest / RTL |
| UT-FE-PRD-01-02 | Muestra skeleton loaders mientras isLoading=true. | Unit | Jest / RTL |
| UT-FE-PRD-01-03 | Los controles de paginación navegan a la página siguiente/anterior. | Unit | Jest / RTL |
| UT-BE-PRD-01-01 | GET /api/products retorna 200 con estructura paginada correcta. | Unit | JUnit 5 |
| UT-BE-PRD-01-02 | GET /api/products?page=2 retorna el segundo bloque de 20. | Unit | JUnit 5 |
 
---
 
### HU-FE-PRD-02 Búsqueda de producto por SKU
 
**RF:** RF-PRD-04 · **RNF:** RNF-PRO-01
 
> *Como operador, quiero buscar un producto escribiendo su SKU en un campo de búsqueda para acceder rápidamente a su información.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El campo de búsqueda es insensible a mayúsculas/minúsculas y ejecuta búsqueda con debounce (300 ms). | Frontend |
| CA-02 | Si el producto existe, se muestra su tarjeta con nombre, descripción, categoría y stock. | Frontend |
| CA-03 | Si el SKU no existe, se muestra el mensaje "Producto no encontrado" con ícono descriptivo. | Frontend |
| CA-04 | El resultado se obtiene en menos de 200 ms (indicador de latencia visible en dev). | Frontend |
| CA-05 | GET /api/products/sku/:sku retorna 200 con el producto o 404 con mensaje descriptivo. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-PRD-02-01 | Ejecuta búsqueda con debounce al escribir en el campo. | Unit | Jest / RTL |
| UT-FE-PRD-02-02 | Muestra tarjeta del producto cuando la API retorna 200. | Unit | Jest / RTL |
| UT-FE-PRD-02-03 | Muestra "Producto no encontrado" cuando la API retorna 404. | Unit | Jest / RTL |
| UT-BE-PRD-02-01 | GET /api/products/sku/abc123 retorna 200 con datos correctos. | Unit | JUnit 5 |
| UT-BE-PRD-02-02 | GET /api/products/sku/INEXISTENTE retorna 404. | Unit | JUnit 5 |
 
---
 
### HU-FE-PRD-03 Formulario de edición de producto
 
**RF:** RF-PRD-02 · **RNF:** RNF-PRO-03, RNF-PRO-04
 
> *Como operador, quiero editar la información de un producto (nombre, descripción, categoría) desde un formulario para mantener el catálogo actualizado.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El formulario carga los datos actuales del producto al abrir la vista de edición. | Frontend |
| CA-02 | Solo usuarios con rol Administrador u Operador ven el botón de edición. | Frontend |
| CA-03 | El campo SKU es de solo lectura (no editable) en el formulario. | Frontend |
| CA-04 | Al guardar, se muestra un toast de éxito y el catálogo se actualiza sin recargar la página. | Frontend |
| CA-05 | PUT /api/products/:id invalida el caché Redis y retorna 200 con el producto actualizado. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-PRD-03-01 | Pre-carga los datos del producto en el formulario. | Unit | Jest / RTL |
| UT-FE-PRD-03-02 | El campo SKU está deshabilitado y no puede editarse. | Unit | Jest / RTL |
| UT-FE-PRD-03-03 | Muestra toast de éxito tras PUT exitoso. | Unit | Jest / RTL |
| UT-FE-PRD-03-04 | El botón de edición no aparece para rol Cliente. | Unit | Jest / RTL |
| UT-BE-PRD-03-01 | PUT /api/products/:id retorna 200 con datos actualizados. | Unit | JUnit 5 |
| UT-BE-PRD-03-02 | PUT /api/products/:id retorna 403 para rol no autorizado. | Unit | JUnit 5 |
 
---
 
### HU-FE-PRD-04 Filtro de productos por categoría
 
**RF:** RF-PRD-05 · **RNF:** RNF-PRO-01
 
> *Como operador, quiero filtrar el catálogo por una o más categorías seleccionando chips para encontrar productos más rápido.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El panel muestra la lista de categorías disponibles como chips seleccionables. | Frontend |
| CA-02 | Al seleccionar una categoría, el catálogo se filtra inmediatamente sin recargar la página. | Frontend |
| CA-03 | La paginación se reinicia al cambiar el filtro de categoría. | Frontend |
| CA-04 | El estado de los filtros se refleja en los query params de la URL (?category=electronica). | Frontend |
| CA-05 | GET /api/products?category=:name retorna solo los productos de esa categoría, paginados. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-PRD-04-01 | Renderiza chips de categoría obtenidos de la API. | Unit | Jest / RTL |
| UT-FE-PRD-04-02 | Al seleccionar un chip, actualiza el query param en la URL. | Unit | Jest / RTL |
| UT-FE-PRD-04-03 | La lista de productos se filtra según la categoría seleccionada. | Unit | Jest / RTL |
| UT-BE-PRD-04-01 | GET /api/products?category=X retorna solo productos de esa categoría. | Unit | JUnit 5 |
 
---
 
## 🏭 Módulo Inventario
 
---
 
### HU-FE-INV-01 Panel de consulta de stock disponible
 
**RF:** RF-INV-02 · **RNF:** RNF-INV-01
 
> *Como usuario autenticado, quiero consultar el stock total, reservado y disponible de un producto desde un panel de inventario.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La pantalla muestra tres métricas en tarjetas: stock total, stock reservado y stock disponible. | Frontend |
| CA-02 | Los valores se actualizan automáticamente al navegar al panel (sin caché del navegador). | Frontend |
| CA-03 | Si el stock disponible es 0, la tarjeta se muestra en color de alerta (rojo/naranja). | Frontend |
| CA-04 | Un selector de producto permite consultar el stock de diferentes SKUs. | Frontend |
| CA-05 | GET /api/inventory/:productId retorna stock_total, stock_reservado, stock_disponible. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-INV-01-01 | Renderiza las tres tarjetas de métricas con datos mockeados. | Unit | Jest / RTL |
| UT-FE-INV-01-02 | La tarjeta de stock disponible cambia a color de alerta cuando el valor es 0. | Unit | Jest / RTL |
| UT-FE-INV-01-03 | El selector de producto dispara una nueva llamada a la API al cambiar. | Unit | Jest / RTL |
| UT-BE-INV-01-01 | GET /api/inventory/:id retorna 200 con las tres métricas de stock. | Unit | JUnit 5 |
| UT-BE-INV-01-02 | GET /api/inventory/:id retorna 404 si el producto no existe. | Unit | JUnit 5 |
 
---
 
### HU-FE-INV-02 Formulario de ajuste manual de inventario
 
**RF:** RF-INV-04 · **RNF:** RNF-INV-03
 
> *Como operador, quiero registrar un ajuste manual de inventario (entrada o salida) indicando cantidad y motivo desde un formulario.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El formulario tiene: tipo (ENTRADA/SALIDA), cantidad y campo de motivo obligatorio. | Frontend |
| CA-02 | El tipo SALIDA deshabilita cantidades mayores al stock disponible actual. | Frontend |
| CA-03 | Solo usuarios con rol Administrador u Operador ven el botón de ajuste. | Frontend |
| CA-04 | Al confirmar el ajuste, el panel de stock se actualiza inmediatamente. | Frontend |
| CA-05 | POST /api/inventory/:id/adjust acepta tipo, cantidad y motivo; retorna 200 con stock actualizado. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-INV-02-01 | Renderiza los campos tipo, cantidad y motivo. | Unit | Jest / RTL |
| UT-FE-INV-02-02 | Deshabilita cantidades de salida superiores al stock disponible. | Unit | Jest / RTL |
| UT-FE-INV-02-03 | El botón de ajuste no aparece para rol Cliente. | Unit | Jest / RTL |
| UT-BE-INV-02-01 | POST /api/inventory/:id/adjust registra el ajuste y retorna 200. | Unit | JUnit 5 |
| UT-BE-INV-02-02 | POST retorna 400 si el ajuste dejaría el stock negativo. | Unit | JUnit 5 |
 
---
 
### HU-FE-INV-03 Panel de alertas de bajo stock
 
**RF:** RF-INV-07 · **RNF:** RNF-INV-01
 
> *Como administrador, quiero ver un listado de alertas de bajo stock con el producto, SKU y stock actual para tomar acciones de reabastecimiento.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La pantalla muestra una tabla con: nombre del producto, SKU, stock actual y umbral configurado. | Frontend |
| CA-02 | Los productos en alerta se destacan visualmente (badge rojo / fila resaltada). | Frontend |
| CA-03 | El administrador puede configurar el umbral de alerta por producto desde un campo inline. | Frontend |
| CA-04 | Si no hay alertas activas, se muestra un estado vacío con mensaje descriptivo. | Frontend |
| CA-05 | GET /api/inventory/alerts retorna la lista de productos bajo umbral con sus datos. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-INV-03-01 | Renderiza la tabla de alertas con datos mockeados. | Unit | Jest / RTL |
| UT-FE-INV-03-02 | Muestra estado vacío cuando no hay alertas. | Unit | Jest / RTL |
| UT-FE-INV-03-03 | El campo de umbral inline permite editar y guarda al hacer blur. | Unit | Jest / RTL |
| UT-BE-INV-03-01 | GET /api/inventory/alerts retorna solo productos bajo umbral. | Unit | JUnit 5 |
 
---
 
### HU-FE-INV-04 Historial de movimientos de inventario
 
**RF:** RF-INV-08 · **RNF:** RNF-INV-03
 
> *Como administrador, quiero consultar el historial de movimientos de un producto filtrando por tipo y rango de fechas para auditar el inventario.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La tabla muestra: tipo de movimiento, cantidad, fecha, usuario responsable y motivo. | Frontend |
| CA-02 | Los filtros de tipo de movimiento (ENTRADA/SALIDA/AJUSTE) y rango de fechas están disponibles. | Frontend |
| CA-03 | La tabla soporta paginación de 20 registros por página. | Frontend |
| CA-04 | Los registros son de solo lectura; no hay botones de edición ni eliminación. | Frontend |
| CA-05 | GET /api/inventory/:id/history acepta filtros type y dateFrom/dateTo con paginación. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-INV-04-01 | Renderiza la tabla con columnas correctas y datos mockeados. | Unit | Jest / RTL |
| UT-FE-INV-04-02 | Los filtros de tipo y fecha actualizan la consulta a la API. | Unit | Jest / RTL |
| UT-FE-INV-04-03 | No existen botones de edición/eliminación en las filas. | Unit | Jest / RTL |
| UT-BE-INV-04-01 | GET /api/inventory/:id/history filtra correctamente por tipo. | Unit | JUnit 5 |
| UT-BE-INV-04-02 | GET retorna registros dentro del rango de fechas indicado. | Unit | JUnit 5 |
 
---
 
## 🛒 Módulo Pedidos
 
---
 
### HU-FE-ORD-01 Formulario de creación de pedido
 
**RF:** RF-ORD-01, RF-ORD-02 · **RNF:** RNF-PED-01, RNF-PED-02
 
> *Como usuario autenticado, quiero seleccionar productos y cantidades en un formulario para crear un nuevo pedido.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El formulario permite agregar múltiples líneas de producto (SKU + cantidad). | Frontend |
| CA-02 | Al agregar un producto, se consulta el stock disponible y se muestra inline. | Frontend |
| CA-03 | Si la cantidad supera el stock disponible, el campo muestra error y deshabilita el submit. | Frontend |
| CA-04 | Al crear el pedido con éxito, se redirige al detalle del pedido con estado "PENDIENTE". | Frontend |
| CA-05 | Si el Circuit Breaker de inventario está abierto, se muestra mensaje "Servicio no disponible". | Frontend |
| CA-06 | POST /api/orders retorna 201 con el pedido creado en estado PENDIENTE. | Backend |
| CA-07 | POST retorna 422 si el stock es insuficiente para algún producto. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-ORD-01-01 | Permite agregar y eliminar líneas de producto en el formulario. | Unit | Jest / RTL |
| UT-FE-ORD-01-02 | Muestra stock disponible al seleccionar un producto. | Unit | Jest / RTL |
| UT-FE-ORD-01-03 | Deshabilita el botón submit si la cantidad supera el stock. | Unit | Jest / RTL |
| UT-FE-ORD-01-04 | Muestra mensaje de servicio no disponible ante error de Circuit Breaker. | Unit | Jest / RTL |
| UT-BE-ORD-01-01 | POST /api/orders crea el pedido en estado PENDIENTE. | Unit | JUnit 5 |
| UT-BE-ORD-01-02 | POST retorna 422 ante stock insuficiente. | Unit | JUnit 5 |
 
---
 
### HU-FE-ORD-02 Listado de pedidos del usuario
 
**RF:** RF-ORD-07 · **RNF:** RNF-PED-02
 
> *Como usuario autenticado, quiero ver el listado de mis pedidos con su estado y fecha para hacer seguimiento de mis compras.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La tabla muestra: ID pedido, fecha, estado actual (con badge de color) y total. | Frontend |
| CA-02 | Los filtros de estado y rango de fechas están disponibles y actualizan la lista. | Frontend |
| CA-03 | Un usuario normal solo ve sus pedidos; el Administrador ve todos. | Frontend |
| CA-04 | La tabla soporta paginación de 20 pedidos por página. | Frontend |
| CA-05 | Al hacer click en una fila, navega al detalle del pedido. | Frontend |
| CA-06 | GET /api/orders retorna pedidos del usuario autenticado (o todos si es Admin). | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-ORD-02-01 | Renderiza la tabla con columnas ID, fecha, estado y total. | Unit | Jest / RTL |
| UT-FE-ORD-02-02 | Los filtros de estado actualizan la lista de pedidos. | Unit | Jest / RTL |
| UT-FE-ORD-02-03 | Click en una fila navega a la ruta /orders/:id. | Unit | Jest / RTL |
| UT-BE-ORD-02-01 | GET /api/orders retorna solo pedidos del usuario autenticado. | Unit | JUnit 5 |
| UT-BE-ORD-02-02 | GET /api/orders retorna todos los pedidos para rol Admin. | Unit | JUnit 5 |
 
---
 
### HU-FE-ORD-03 Detalle de pedido y trazabilidad de estados
 
**RF:** RF-ORD-08, RF-ORD-09 · **RNF:** RNF-PED-01, RNF-PED-03
 
> *Como usuario autenticado, quiero ver el detalle completo de un pedido incluyendo productos, precios y el historial de estados para saber en qué etapa se encuentra.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | La pantalla muestra: productos, cantidades, precios unitarios, total y estado actual. | Frontend |
| CA-02 | El historial de estados se muestra como una línea de tiempo (timeline) con fecha y usuario. | Frontend |
| CA-03 | El estado actual se resalta visualmente en el timeline con el badge correspondiente. | Frontend |
| CA-04 | Si el pedido no pertenece al usuario, se muestra una pantalla de error 403. | Frontend |
| CA-05 | El historial de estados es inmutable: no hay botones de edición en la timeline. | Frontend |
| CA-06 | GET /api/orders/:id retorna 200 con detalle y historial de estados; 403 si no es el dueño. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-ORD-03-01 | Renderiza la lista de productos con cantidades y precios. | Unit | Jest / RTL |
| UT-FE-ORD-03-02 | Renderiza la timeline de estados con fechas y usuarios. | Unit | Jest / RTL |
| UT-FE-ORD-03-03 | Muestra pantalla de error 403 cuando el pedido no pertenece al usuario. | Unit | Jest / RTL |
| UT-FE-ORD-03-04 | No existen controles de edición en la sección de historial. | Unit | Jest / RTL |
| UT-BE-ORD-03-01 | GET /api/orders/:id retorna 200 con historial de estados. | Unit | JUnit 5 |
| UT-BE-ORD-03-02 | GET /api/orders/:id retorna 403 si el pedido no pertenece al usuario. | Unit | JUnit 5 |
 
---
 
### HU-FE-ORD-04 Cancelación de pedido
 
**RF:** RF-ORD-05, RF-ORD-06 · **RNF:** RNF-PED-01
 
> *Como usuario autenticado, quiero cancelar un pedido en estado Pendiente o Confirmado desde el detalle del pedido para desistir de la compra.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El botón "Cancelar pedido" solo aparece si el pedido está en estado PENDIENTE o CONFIRMADO. | Frontend |
| CA-02 | Al pulsar el botón, se muestra un modal de confirmación con campo de motivo opcional. | Frontend |
| CA-03 | Tras cancelar, el estado del pedido se actualiza a CANCELADO en pantalla sin recargar. | Frontend |
| CA-04 | Si la cancelación falla (error de servidor), se muestra un toast de error descriptivo. | Frontend |
| CA-05 | PATCH /api/orders/:id/cancel retorna 200 con estado CANCELADO; 409 si el estado no permite cancelación. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-ORD-04-01 | El botón "Cancelar" aparece solo para estados PENDIENTE y CONFIRMADO. | Unit | Jest / RTL |
| UT-FE-ORD-04-02 | El modal de confirmación se muestra al pulsar el botón. | Unit | Jest / RTL |
| UT-FE-ORD-04-03 | El estado del pedido cambia a CANCELADO en pantalla tras la confirmación. | Unit | Jest / RTL |
| UT-FE-ORD-04-04 | Muestra toast de error si la API retorna 500. | Unit | Jest / RTL |
| UT-BE-ORD-04-01 | PATCH /api/orders/:id/cancel retorna 200 y publica evento Kafka. | Unit | JUnit 5 |
| UT-BE-ORD-04-02 | PATCH retorna 409 si el pedido está en estado ENTREGADO. | Unit | JUnit 5 |
 
---
 
### HU-FE-ORD-05 Gestión de estados del pedido (Admin)
 
**RF:** RF-ORD-03, RF-ORD-04 · **RNF:** RNF-PED-01
 
> *Como administrador, quiero actualizar el estado de un pedido manualmente (Confirmado → Enviado → Entregado) desde el panel de administración.*
 
#### Criterios de Aceptación
 
| N° | Criterio | Capa |
|----|----------|------|
| CA-01 | El panel muestra todos los pedidos con selector de estado editable. | Frontend |
| CA-02 | El selector solo muestra las transiciones válidas según el estado actual del pedido. | Frontend |
| CA-03 | Cada cambio de estado requiere confirmación mediante modal antes de ejecutarse. | Frontend |
| CA-04 | Solo el rol Administrador ve el selector de cambio de estado. | Frontend |
| CA-05 | PATCH /api/orders/:id/status acepta el nuevo estado; retorna 200 con el pedido actualizado. | Backend |
| CA-06 | PATCH retorna 422 si la transición de estado no es válida según el flujo definido. | Backend |
 
#### Pruebas Unitarias
 
| ID Test | Descripción | Tipo | Herramienta |
|---------|-------------|------|-------------|
| UT-FE-ORD-05-01 | El selector de estado solo muestra transiciones válidas. | Unit | Jest / RTL |
| UT-FE-ORD-05-02 | Muestra modal de confirmación antes de cambiar el estado. | Unit | Jest / RTL |
| UT-FE-ORD-05-03 | El selector no aparece para usuarios con rol no-Admin. | Unit | Jest / RTL |
| UT-BE-ORD-05-01 | PATCH /api/orders/:id/status actualiza el estado y registra en historial. | Unit | JUnit 5 |
| UT-BE-ORD-05-02 | PATCH retorna 422 para transición no válida (ej. ENTREGADO→PENDIENTE). | Unit | JUnit 5 |
 
---
 
*SmartLogix — HU Frontend v1.0 · 2025*