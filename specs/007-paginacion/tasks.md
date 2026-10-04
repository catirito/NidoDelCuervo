# Tareas — 007: paginación del registro

Desglose e implementación autorizados; completados y validados localmente. Completar en orden; marcar cada tarea únicamente tras verificar su resultado. Trabajar en codex/007-paginacion. No escribir ni ejecutar tests en producción.

## 1. Preparar consulta y migración local
- [x] T001 Definir parser de parámetros de GET: defaults, tamaños 20/50/100/all, campos de orden permitidos, filtros, búsqueda literal y modo ids exclusivo. Rechazar parámetros desconocidos/repetidos, UUID inválidos y límites excedidos.
- [x] T002 Preparar migración de columna interna de nombre normalizado y carga transaccional desde personajes actuales. Conservar UUID, datos y versiones; no reimportar Excel. Documentar procedimiento de inicialización para una base existente y una nueva, y recuperación ante fallo.
- [x] T003 Actualizar importación inicial y guardado de PERSONAJE para mantener la clave normalizada sin exponerla como campo editable. Comprobar que renombrar permite buscar inmediatamente el nuevo nombre.

## 2. Implementar API paginada y opciones globales
- [x] T004 Construir WHERE parametrizado con búsqueda sin distinguir mayúsculas españolas, acentos diferenciados y categorías exactas combinadas con AND.
- [x] T005 Aplicar orden global antes de LIMIT/OFFSET: nivel numérico, posiciones de valores distintos mediante Intl.Collator español, vacíos al final y desempate sourceRow. Evitar cargar todos los registros para ordenar.
- [x] T006 Resolver página efectiva, totales y filas en lectura coherente; devolver pagination, characters de la página, catalogs completos, filterOptions globales y editOptions globales. Cubrir all, cero resultados y página fuera de rango.
- [x] T007 Implementar GET por ids para reconciliación: devolver únicamente UUID solicitados y missingIds explícitos, con catálogos/opciones globales, sin paginación. Mantener contrato de PATCH batch.
- [x] T008 Verificar API y migración en D1 local: páginas disjuntas y completas, totales, filtros fuera de primera página, orden global, Unicode, %/_, opciones globales y parámetros inválidos. Adaptar pruebas anteriores que asumían GET sin límite para pedir all explícitamente cuando corresponda.

## 3. Separar borradores de las páginas cargadas
- [x] T009 Separar filas de página y mapa por UUID de originales/versiones pendientes. Navegar no elimina borradores ni renueva silenciosamente versiones; renderizar propuestas al volver a la fila.
- [x] T010 Mantener opciones pendientes de estado, propietario y catálogos entre páginas, y validación de subclase ligada a clase. Validar y enviar todos los cambios en un solo PATCH, incluso los no visibles.
- [x] T011 Reconciliar conflictos/respuestas perdidas mediante GET ids: conservar propuestas distintas, retirar cambios ya guardados, exigir revisión de clase/subclase remota y no reintentar automáticamente.
- [x] T012 Tratar missingIds sin pérdida silenciosa: identificar el personaje, bloquear su reenvío y permitir retirar explícitamente ese borrador con un control accesible. Tras éxito recargar consulta activa y ajustar página si procede.

## 4. Conectar consulta y controles de paginación
- [x] T013 Sustituir filtrado/ordenación local por estado de consulta y peticiones al servidor. Búsqueda con debounce 250 ms; filtros, orden y tamaño vuelven a página 1. Conservar filtros seleccionados al renovar opciones.
- [x] T014 Cancelar consultas superadas e ignorar respuestas tardías. Durante carga no permitir edición de filas antiguas; errores preservan borradores y estado previo con reintento explícito.
- [x] T015 Añadir paginador inferior: Anterior, página/total, Siguiente, rango de resultados y selector 20/50/100/Todos en esquina inferior derecha. Mantener estructura HTML, CSS y lógica separadas y seguir la guía visual del proyecto al implementar.
- [x] T016 Elegir tamaño inicial 20 a max-width 760px y 50 en escritorio, una sola vez por visita. No sobrescribir selección manual al redimensionar. Cuidar etiquetas, teclado, foco, aria-live, extremos deshabilitados y disposición móvil.

## 5. Validación local y entrega
- [x] T017 Comprobar en navegador escritorio/móvil, tamaños y Todos, cero resultados, cambios rápidos, respuestas tardías y errores. Confirmar búsqueda/filtros globales y selector de opciones fuera de la página.
- [x] T018 Comprobar edición en varias páginas, retorno a fila pendiente, revertir un campo, nuevas opciones y un único guardado atómico. Verificar conflicto de personaje no visible, respuesta perdida y retirada explícita de personaje desaparecido.
- [x] T019 Ejecutar comprobaciones locales proporcionales de consulta, rangos, edición de textos/catálogos, concurrencia, temas y accesibilidad. Restaurar únicamente datos modificados por pruebas; conservar datos previos y Excel intacto.
- [x] T020 Registrar resultados y límites en plan/tasks/Memories, mantener README breve y mostrar resultado local. No hacer commit final, push de implementación, merge ni despliegue sin autorización de entrega.

## Evidencia y límites
- API local: páginas 20/50/100/Todos, cobertura completa sin duplicados, orden español global, búsqueda Unicode y literales, filtros globales, cero coincidencias, ajuste de página y validación de parámetros/UUID.
- Inicialización en D1 aislada: identidades/versiones conservadas y rollback del lote si el snapshot está obsoleto. D1 de trabajo: 203 claves inicializadas; no se reimportó Excel.
- Chrome local: 50 escritorio/20 móvil, selector, borradores en dos páginas, un único PATCH, conflicto fuera de página, renombrado y búsqueda, error/recuperación, respuesta perdida, retirada explícita de personaje de prueba desaparecido y descarte de respuesta antigua. Paginador revisado en oscuro y claro; sin desbordamiento móvil. Regresiones de cursor, textos, catálogos, clase/subclase, temas y lote atómico pasan.
- Pruebas API previas que precisan todo el registro consultan pageSize=all; pruebas UI previas esperan las consultas asíncronas. Los datos de prueba se restauran; las versiones avanzan por esas escrituras locales.
- Comandos utilizados: node tests/records.test.mjs, tests/api.test.mjs, tests/character-editing.test.mjs, tests/catalogs.test.mjs, tests/character-editing-ui.test.cjs, tests/catalogs-ui.test.cjs, tests/search-initialization.test.mjs, tests/pagination.test.mjs, tests/pagination-ui.test.cjs y tests/pagination-recovery-ui.test.cjs. Miniflare/Playwright existentes mediante MINIFLARE_MODULE/PLAYWRIGHT_MODULE; sin nuevas dependencias.
- Excel de solo lectura intacto. No hay tests ni cambios en producción. No se han verificado todos los navegadores ni un lector de pantalla real.
- Resultado servido en http://127.0.0.1:8788. Capturas local-paginador.png y local-paginador-movil.png. Commit final, push de implementación, merge y publicación pendientes de autorización.
