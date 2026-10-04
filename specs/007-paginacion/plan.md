# Plan — 007: paginación del registro

## 1. Contrato de consulta
Extender GET /api/characters; mantener PATCH /api/characters/batch para guardar. No añadir endpoint de escritura.

Consulta normal:

```http
GET /api/characters?page=1&pageSize=50&search=luc&class=Ranger&sort=NIVEL&direction=desc
```

Parámetros: page entero desde 1 (default 1); pageSize 20, 50, 100 o all (default 50); search para fragmento de nombre; class, subclass, species, rank y owner para filtros exactos combinados con AND; sort NIVEL, CLASS, SUBCLASS, SPECIE, RANGO o PROPIETARIO (default NIVEL); direction asc/desc (default desc). Valores inválidos, repetidos o parámetros desconocidos devuelven 400. Escapar búsqueda literal: % y _ no son comodines. Mantener distinción de acentos y búsqueda sin distinguir mayúsculas, también en caracteres españoles.

Respuesta propuesta:

```json
{
  "characters": [],
  "pagination": { "page": 1, "pageSize": 50, "totalMatches": 203, "totalRecords": 203, "totalPages": 5 },
  "catalogs": { "classes": [], "subclasses": [], "species": [] },
  "filterOptions": { "CLASS": [], "SUBCLASS": [], "SPECIE": [], "RANGO": [], "PROPIETARIO": [] },
  "editOptions": { "ESTADO": [], "PROPIETARIO": [] }
}
```

Characters contiene exclusivamente la página efectiva. pageSize es "all" en Todos. Sin coincidencias: characters vacío, page 1, totalPages 0. Ajustar página solicitada superior al total a la última válida y devolver la página efectiva. Totales y filas se obtienen en una misma transacción de lectura D1 para coherencia.

## 2. Filtros, orden y opciones globales en D1
Aplicar WHERE y ORDER BY antes de LIMIT/OFFSET. En Todos, omitir LIMIT pero mantener criterios. Parametrizar valores; columnas/dirección se eligen mediante listas permitidas. Orden inicial NIVEL descendente, desempate sourceRow ascendente, vacíos al final en ambos sentidos.

No sustituir Intl.Collator('es') por el orden binario de SQLite: cambiaría el comportamiento actual. Obtener valores distintos del campo de orden en toda D1, ordenarlos con el comparador español existente y pasar sus posiciones a SQL como mapa JSON para ordenar antes de limitar. Solo se consulta este metadato de texto, no todos los personajes. El mismo comparador ordena opciones globales.

Para conservar búsqueda Unicode sin cargar personajes, añadir una columna interna de nombre normalizado con toLocaleLowerCase('es'), inicializada mediante migración de datos controlada y actualizada al guardar PERSONAJE. Usar búsqueda literal por substring sobre esa columna. No modificar el contrato de campos editables ni reimportar Excel. Inicializar sobre registros actuales conservando UUID y versiones, dentro de una transacción; no dejar la columna a medias. Revisar índices y añadir únicamente los justificados para esta consulta; no prometer aceleración por índice de una búsqueda de substring.

filterOptions procede de DISTINCT sobre toda characters, independiente de página y filtros activos. Conserva la semántica existente de valores usados y excluye vacíos. catalogs contiene todas las clases/subclases/especies, incluidas opciones sin uso. editOptions contiene estados y propietarios globales para que paginar no recorte sus selectores. Valores nuevos pendientes se combinan localmente sin escribir.

## 3. Estado de consulta y paginador
Separar estado de consulta (criterios, orden, página, tamaño, totales) del estado de edición. Reemplazar filtrado/ordenación local de la tabla por peticiones al servidor. Debounce de búsqueda de 250 ms; filtros, orden y navegación consultan inmediatamente. Cancelar consultas anteriores y comprobar identificador de petición para ignorar respuestas tardías.

Usar max-width 760px, breakpoint móvil existente, para tamaño inicial: 20 en móvil y 50 en escritorio. Resolver una sola vez al iniciar; redimensionar no sobrescribe la elección ni dispara una carga innecesaria. Selector 20, 50, 100, Todos en esquina inferior derecha, sin persistencia adicional. Cambiar criterio/orden/tamaño vuelve a página 1.

Debajo de la tabla, controles compactos coherentes con el diseño: Anterior, indicador Página X de Y, Siguiente y selector etiquetado Registros por página. Mostrar rango de filas y total de coincidencias; cero resultados tiene mensaje específico. Botones deshabilitados en extremos y carga, aria-live para resultados, foco estable y disposición móvil sin desbordamiento de página. Mantener selección de filtros al renovar opciones globales; valores seleccionados recién eliminados no se borran silenciosamente. Errores conservan consulta, página previa y borradores, ofreciendo reintento explícito. No permitir editar filas antiguas como si pertenecieran a la consulta nueva durante una carga.

## 4. Edición y recuperación entre páginas
Conservar un mapa por UUID de originales y versiones de personajes pendientes, separado de las filas de la página. Al navegar, retener borradores y originales; no refrescar silenciosamente la versión esperada de una fila pendiente. Superponer propuestas sobre las filas recibidas. Borrar campos que vuelven al original, conservar el control de clase/subclase y nuevas opciones entre páginas.

Guardar envía todos los UUID modificados, visibles o no, en una sola operación atómica. Validar el borrador completo antes de enviar. Tras éxito limpiar cambios confirmados, renovar opciones globales y recargar la página con criterios activos. Si la página deja de existir, ajustar a la última válida. No aplicar filtro ni reordenar una fila durante escritura local; las consultas se basan en valores guardados y los filtros se reaplican tras guardar.

Para Actualizar y revisar, usar un modo de lectura independiente de página:

```http
GET /api/characters?ids=uuid1,uuid2
```

ids acepta UUID únicos, máximo 203 conforme al límite de guardado vigente. Es incompatible con parámetros de consulta paginada. Devuelve characters solicitados, missingIds explícitos, catalogs y opciones globales; sin metadatos de paginación. No exige cargar todos los personajes. Mantener pertenencia al borrador y versión original hasta reconciliación explícita. Ante personaje desaparecido, mostrar su identidad y bloquear su reenvío hasta retirar ese cambio; no eliminarlo silenciosamente. Campos ya guardados tras respuesta perdida se retiran, otros permanecen, sin reintento automático. Mantener revisión obligatoria de subclase si la clase remota cambia.

## 5. Validación y entrega
Verificar exclusivamente en D1 y navegador locales:
- 50 iniciales escritorio, 20 móvil, 20/50/100/Todos, extremos y cero resultados.
- Buscar/filtrar personajes fuera de la primera página; totales y orden global estable, caracteres españoles y búsquedas literales %/_; opciones globales aunque ausentes de página.
- Respuestas tardías, error de consulta y cambios rápidos de filtros/tamaño.
- Borradores en varias páginas, regreso a una fila pendiente, nuevas opciones entre páginas, un PATCH para todo el lote, conflicto en una fila no visible, respuesta perdida y desaparición de personaje.
- Edición de nombre actualiza su clave de búsqueda; migración conserva datos, identidades y versiones; regresiones de búsqueda/orden, clase/subclase, accesibilidad, temas y móvil.

Actualizar documentación y memoria con resultados y límites. No ejecutar tests en producción. No desplegar, integrar ni crear commit final hasta autorización de entrega. Plan, tareas e implementación autorizados. Implementación y validación local completadas; entrega pendiente de revisión.

## Resultado de implementación local
Implementación completada y verificada según tasks.md. Se conserva el esquema y contrato acordados. No se añadieron índices: el registro actual es pequeño, las opciones/contadores requieren lectura global y un índice común no acelera instr por fragmentos. Se reutiliza el índice único sourceRow existente. La consulta de orden textual reintenta hasta dos veces si cambian los valores distintos entre la lectura del mapa y la transacción de filas/totales; si continúan cambiando devuelve servicio no disponible para evitar una página con orden incoherente.

Dirección visual aplicada: superficie discreta gris, borde púrpura y controles compactos. Paginador bajo la tabla con navegación a la izquierda y selector a la derecha; en móvil dos líneas. Interacción sin animación añadida, estados de carga claros y recuperación de foco al navegar/guardar.

### Preparación local de búsqueda
Para una base existente, aplicar migraciones locales y generar el backfill desde su estado actual:

```sh
wrangler d1 migrations apply DB --local
wrangler d1 execute DB --local --command 'SELECT id, PERSONAJE, version FROM characters ORDER BY sourceRow' --json > .local/search-source.json
node scripts/initialize-search.mjs .local/search-source.json .local/initialize-search.sql
wrangler d1 execute DB --local --file .local/initialize-search.sql
node scripts/build-cloudflare.mjs
wrangler pages dev --port 8788 --ip 127.0.0.1
```

El generador rechaza sobrescribir su salida. La carga verifica cantidad, UUID, nombres y versiones antes de actualizar; si hay un cambio concurrente, toda la transacción falla. Reexportar y generar otro archivo nuevo para reintentar. La columna se añade con valor vacío; mientras haya nombres no inicializados, GET devuelve 503 explícito en vez de resultados de búsqueda incompletos. Una base nueva se prepara con todas las migraciones y la importación inicial actualizada, que incluye name_search; no necesita backfill ni debe reimportarse una base existente.

### Despliegue futuro (pendiente de autorización)
Mantener wrangler.jsonc local y wrangler.production.jsonc remoto separados. No ejecutar los comandos locales contra producción. Al autorizar publicación: aplicar únicamente la nueva migración, desplegar la versión que mantiene name_search en cada edición y después exportar nombres/versiones actuales e inicializar claves con el script y la transacción protegida. GET puede mostrar indisponibilidad durante esa inicialización; no anunciar publicación final hasta completarla. Ese orden evita que un backend antiguo cambie nombres sin mantener la clave después de inicializarla. Si el snapshot cambia entretanto, reexportar/reintentar; no restaurar ni reimportar personajes. Solo recuperación ante fallos de migración, sin tests en producción. El empaquetado conserva su lista explícita de archivos y excluye Excel y SQL.
