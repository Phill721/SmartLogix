HU-PRD-01  Visualización del catálogo de productos
"Como usuario autenticado, quiero visualizar el catálogo completo de productos con nombre, SKU, descripción y categoría, para conocer los artículos disponibles."
RF: RF-PRD-01, RF-PRD-03   RNF: RNF-PRO-01, RNF-PRO-02
N°	Criterio de Aceptación
CA-01	El catálogo debe mostrarse con paginación (máximo 20 productos por página).
CA-02	Cada producto debe mostrar: nombre, SKU, descripción, categoría e imagen.
CA-03	Las respuestas del catálogo deben ser servidas desde Redis Cache para lecturas frecuentes (RNF-PRO-01).
CA-04	El tiempo de respuesta del catálogo no debe superar 500 ms incluyendo imágenes.
CA-05	El componente del catálogo debe estar empaquetado como módulo reutilizable (RNF-PRO-02).

HU-PRD-02  Búsqueda de producto por SKU
"Como operador, quiero buscar un producto específico ingresando su SKU, para acceder rápidamente a su información sin navegar el catálogo completo."
RF: RF-PRD-04   RNF: RNF-PRO-01
N°	Criterio de Aceptación
CA-01	La búsqueda por SKU debe retornar el producto exacto o un mensaje indicando que no existe.
CA-02	La consulta debe resolverse desde Redis Cache si el producto fue accedido recientemente.
CA-03	El resultado debe incluir nombre, descripción, categoría y stock disponible.
CA-04	La búsqueda debe ser insensible a mayúsculas/minúsculas.
CA-05	El tiempo de respuesta no debe superar 200 ms.

HU-PRD-03  Actualización de información de productos
"Como operador, quiero actualizar la información de un producto existente (nombre, descripción, categoría), para mantener el catálogo preciso y actualizado."
RF: RF-PRD-02   RNF: RNF-PRO-03, RNF-PRO-04
N°	Criterio de Aceptación
CA-01	Solo usuarios con rol Administrador u Operador pueden actualizar productos.
CA-02	Al actualizar un producto, el caché de Redis debe invalidarse para reflejar los nuevos datos.
CA-03	El sistema debe validar que el SKU no quede duplicado si se modifica.
CA-04	Los cambios deben persistirse mediante JPA/Repository Pattern.
CA-05	El módulo debe contar con cobertura mínima de pruebas unitarias del 60% (RNF-PRO-03).

HU-PRD-04  Clasificación por categoría
"Como operador, quiero clasificar y filtrar productos por categoría, para facilitar su organización y la navegación del catálogo."
RF: RF-PRD-05   RNF: RNF-PRO-01
N°	Criterio de Aceptación
CA-01	El sistema debe permitir filtrar el catálogo por una o más categorías.
CA-02	Las categorías deben ser configurables por un Administrador.
CA-03	El filtro por categoría debe operar sobre los datos en caché cuando estén disponibles.
CA-04	Los resultados filtrados deben respetar la paginación.
CA-05	Un producto puede pertenecer a una sola categoría.

