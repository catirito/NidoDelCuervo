# Plan — edición de clase, subclase y especie

Estado: plan e implementación autorizados junto con tareas; trabajo local, sin commit, push ni publicación autorizados para 006. Rama `codex/006-edicion-catalogos`, con 005 como base.

## 1. Catálogos dentro de D1
Añadir `classes` y `species` con UUID v4 estable, nombre y clave normalizada única. Añadir `subclasses` con UUID, referencia a `classes`, nombre y clave única dentro de su clase. Misma D1; no crear servicios ni bases remotas. Conservar las columnas de texto del contrato actual de personajes y validar su correspondencia con los catálogos; no migrar sus UUID ni reimportar personajes. La relación de subclase a clase se impone con clave foránea.

Claves normalizadas por trim y minúsculas, sin quitar acentos ni espacios interiores. Longitud máxima 50 puntos de código Unicode; «Sin dato» se representa con null en personajes, nunca como opción de catálogo. Un nombre de subclase puede existir en varias clases.

## 2. Importación local de catálogos y corrección acordada
Leer Classes y Species del Excel en modo de solo lectura y verificar encabezados. Usar filas con datos, no las filas vacías con formato. Importar solo nombres y relaciones; excluir tamaños/fuentes de la interfaz y no inventar valores. Conciliar con registros actuales de D1 para conservar opciones ya utilizadas. Admitir Ranger–Phantom según aclaración del usuario, además de Rogue–Phantom.

Corregir Ágios de Barbarian–Oath of Devotion a Paladin–Oath of Devotion solo si el registro identificado por sourceRow 49 conserva nombre/clase/subclase esperados. Conservar UUID y todos los demás campos, incrementar versión; ante estado inesperado, detener la carga para revisión. La carga inicial de catálogos debe rechazar ejecución sobre catálogos ya poblados y no ejecutarse durante preparación/despliegue de archivos.

## 3. Contrato y transacción de escritura
GET /api/characters devuelve personajes y `catalogs` con classes, subclasses (incluyendo classId) y species. Devuelve todas las opciones, aunque ningún personaje las use. No crear endpoints adicionales.

PATCH /api/characters/batch admite también CLASS, SUBCLASS y SPECIE en fields. Extender el contrato con `catalogAdditions` opcional: clases/especies por nombre, subclases por clase y nombre. Sirve para distinguir seleccionar una opción de crearla. Enviar solo opciones necesarias para cambios finales del lote; no aceptar altas independientes de personajes ni crear opciones de borradores revertidos.

Validar longitudes, tipos, identidad, versiones y pertenencia de subclase a clase. Cambiar clase requiere limpiar la subclase incompatible o seleccionar una válida; el servidor rechaza combinaciones incoherentes. Una subclase nueva exige clase seleccionada. Normalizar/reutilizar grafía existente; coherencia también entre opciones nuevas del mismo lote.

Usar D1 batch como transacción con inserts/upserts preparados de catálogos seguidos de la actualización atómica existente de personajes. Todas las escrituras de catálogo deben condicionarse a que coincidan todas las versiones del lote; la actualización final usa la misma condición. Si hay un conflicto previo o de carrera, no crear opciones ni modificar personajes. Claves únicas evitan duplicación de opciones en solicitudes concurrentes; devolver grafía de catálogos autoritativa y personajes resultantes. Una excepción en cualquier sentencia revierte la transacción. Mantener no-store/noindex, errores y API sin autenticación de entregas anteriores.

## 4. Selectores dependientes y borrador
Reutilizar los selectores aprobados de estado/propietario, con «Sin dato» y «Añadir…» e input asociado. Clases/especies muestran catálogos completos; subclases solo las de la clase seleccionada, incluyendo nuevas opciones del borrador de esa clase. Sin clase, deshabilitar subclase. Cambiar clase limpia subclase incompatible y actualiza ese selector sin perder otros textos, foco o borrador.

Mantener el borrador por UUID/campo, visibilidad de filas hasta Guardar y una petición por lote. Derivar catalogAdditions al guardar desde los cambios finales y la clase efectiva de cada personaje. Tras éxito, aplicar personajes/catálogos del servidor. Reconciliar conflictos y respuesta perdida para estos campos y regenerar catálogos al actualizar. Si una opción se creó en una respuesta perdida, reutilizarla al siguiente envío.

## 5. Validación y entrega local
Verificar importación real, corrección de Ágios, Ranger/Rogue–Phantom separados, catálogos completos y sin reimportar personajes. Probar nuevas opciones, pertenencia, vacíos, límites, normalización, opciones revertidas y persistencia sin uso. Probar conflicto y concurrencia que no creen catálogos parciales, incluyendo fallo de sentencia dentro de la transacción.

Navegador local: selectores dependientes, clase nueva/subclase vinculada, especie nueva, cursor/foco, borrador mixto, una petición, recarga, conflictos, filtros, tema y móvil. Regresión proporcional de 004/005 y hash del Excel. Restaurar datos de personajes usados en pruebas y eliminar únicamente opciones creadas por esas pruebas en local. No ejecutar tests en producción.

Documentar evidencia y mostrar aplicación local al usuario; no crear recursos remotos, hacer commit/push ni publicar 006 sin autorización adicional.

## Resultado
Implementación completada y validada en D1/Chrome locales. Tres migraciones totales del proyecto: personajes, catálogos y guardia de carga inicial. Catálogos iniciales 15/150/179; corrección de Ágios y conservación de UUID/demás campos comprobadas. Detalles y pruebas en tasks.md. Fuente de garantía transaccional: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch. Sin commit, push ni publicación autorizados.
