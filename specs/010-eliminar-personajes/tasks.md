# Tareas — 010: eliminar personajes

Estado: implementación y validación local completadas en codex/010-eliminar-personajes. Usuario autoriza commit, push y publicación en producción el 5 de octubre de 2026; integración en main no solicitada en esta entrega.

## 1. Persistencia y contrato del lote
- [x] T001 Crear migración incremental `migrations/0006_character_soft_delete.sql` con is_deleted INTEGER NOT NULL DEFAULT 0 y CHECK 0/1. Tras autorización de implementación, aplicar exclusivamente en D1 local aislada y comprobar que datos, UUID, versiones, sourceRow, name_search, catálogos y recibos anteriores permanecen intactos. No reimportar Excel.
- [x] T002 Extender el validador PATCH en server/characters.js para admitir únicamente fields.is_deleted=true, sola o junto a campos actuales. Rechazar false/null/números/texto; retirar marca omite la clave. Mantener UUID, versiones, campos, límites de 203 por lote/3 MiB y validaciones existentes. No incorporar la marca a editableFields del alta.
- [x] T003 Extender updateBatchSql para persistir campos editados y marca juntos, conservar campos omitidos y derivar rango/name_search cuando corresponda. Incrementar version una sola vez por fila; devolver también eliminados del lote con is_deleted booleano.
- [x] T004 Añadir actividad además de versión a la guardia conjunta del UPDATE y a catalogWrites de PATCH. Conservar creación atómica de opciones utilizadas por filas que se guardan como eliminadas; una carrera o fallo no debe dejar catálogos ni cambios parciales. No alterar la escritura de catálogos del POST de alta.
- [x] T005 Adaptar functions/api/characters/batch.js: validar todas las filas activas y versiones, devolver 409 para filas ya eliminadas/obsoletas y 404 para inexistentes, conservar 400/422/503, origen/cabeceras y SQL preparado. Confirmar éxito solo cuando devuelve todos los UUID del lote.

Dependencias: T001 antes de consultas de marca; T002–T003 antes de T005; T004 y T005 deben quedar completos antes de validar atomicidad.
Resultado verificable: borrado lógico y campos persisten juntos sin vaciar datos o aceptar restauración.

## 2. Consultas, exportación y alta compatible
- [x] T006 En server/query.js aplicar is_deleted=0 a listado, pageSize=all, búsqueda/filtros, readiness, ordenación preliminar, totalMatches y totalRecords. Derivar filterOptions/editOptions de activos y mantener coherencia de la comparación de opciones; conservar catálogos completos independientes del uso.
- [x] T007 Mantener reajuste de página efectiva y cero activos sin huecos. Conservar parámetros de consulta y nueve campos de tabla/Excel. Comprobar que el bloqueo actual de exportación por totalRecords=0 sigue funcionando y que pageSize=all entrega solo activos con el orden activo; no modificar export-excel.js.
- [x] T008 Ampliar GET ids para devolver registros solicitados existentes incluso eliminados, con campos/versión/is_deleted booleano. missingIds solo para ausentes; metadatos de activos. No añadir parámetros ni UI para listar eliminados.
- [x] T009 Añadir estado booleano a respuestas de creación/reintento en server/create-character.js. Confirmar que las altas nuevas usan el default activo, POST rechaza la marca y recibos idénticos devuelven el estado actual sin duplicar ni reactivar un eliminado.
- [x] T010 Adaptar create-character.js para confirmar un alta recuperada que ya fue eliminada con mensaje adecuado y refrescar la lista. Usar el UUID/recibo existente; no crear una operación nueva, sobrescribir ni ofrecer restauración.

Dependencias: T006–T009 requieren T001; T010 requiere T008–T009. T007 acompaña T006 y se verifica con exportación existente.
Resultado verificable: lista/Excel contienen solo activos; recuperación distingue eliminado de inexistente y conserva alta idempotente.

## 3. Borrador y controles de eliminación
- [x] T011 Integrar is_deleted en el borrador de editing.js con validación propia, sin pasarlo por validateField de campos de negocio. Alternar true/clave ausente conservando otros fields; borrar la entrada solo si no queda ningún cambio. Mantener identidad UUID y originales/versiones entre páginas.
- [x] T012 Construir botón X decorativa y «Eliminar» con aria-pressed y nombre accesible del personaje. Mostrar señal «Eliminación pendiente» y devolver foco al mismo UUID tras alternar/renderizar. Mantener campos editables en filas marcadas para guardar cambios y marca juntos.
- [x] T013 En index.html/app.js añadir encabezado accesible Acciones y celda al extremo derecho de Notas solo durante edición. Fuera de edición conservar nueve columnas; no añadir acciones a records.js ni exportación. Mantener visible la fila pendiente mientras siga activa en la página de edición.
- [x] T014 En styles.css adaptar rojo/contraste a claro y oscuro, área de interacción y foco visible; conservar scroll horizontal en móvil, cabecera/contador de 008 y controles compartidos de 009. No rediseñar ni añadir Cancelar global.
- [x] T015 Ampliar estado accesible para total de personajes pendientes y cuántos están marcados, sin doble contarlos. Bloquear alternancia durante carga/guardado o revisión requerida; mantener beforeunload cuando haya borrador aunque solo contenga eliminaciones. No escribir al alternar ni cambiar página.
- [x] T016 Conectar guardado de borrador a PATCH ampliado: validar todos los campos de filas marcadas, omitir false tras desmarcar y incluir true con campos modificados. Tras éxito confirmar lote completo, vaciar borradores, salir de edición y refrescar manteniendo consulta y aviso de éxito si falla la recarga.

Dependencias: T011 antes de T012/T015; T012–T014 se integran juntos; T016 requiere T002–T005, T006–T008 y T011–T015.
Resultado verificable: marca local alternable y accesible; otras ediciones no se descartan ni se guardan anticipadamente.

## 4. Reconciliación y conflictos
- [x] T017 Extender refreshDraft para registros activos: reconciliar campos coincidentes, mantener eliminación pendiente si sigue activo y revisar cambios de versión antes de reenviar. Un fallo de GET conserva todo el borrador; no renovar versiones silenciosamente al paginar.
- [x] T018 Reconciliar registro eliminado con borrador de eliminación comparando también todos los campos editados enviados. Retirar esa entrada solo cuando su estado final coincida; no confirmar todo el lote por una única fila/marca ni reenviar la eliminación ya aplicada.
- [x] T019 Para eliminado con campos divergentes o borrador solo de edición, conservar propuesta bloqueada y explicar que no puede guardarse. Adaptar retirada explícita existente; no restaurar, duplicar ni reenviar usando la versión nueva. Mantener tratamiento de ausentes físicamente separado.
- [x] T020 Excluir eliminados de la página visible incluso si su snapshot se conserva para explicar un conflicto. Mantener datos necesarios para retirar borradores bloqueados; habilitar Guardar solo tras resolverlos y conservar el resto de borradores y consulta.

Dependencias: T017–T020 requieren T008 y T011–T016; no dar por terminado guardado recuperable antes de completar este bloque.
Resultado verificable: respuesta perdida o eliminación ajena no provoca restauraciones, pérdidas silenciosas ni confirmaciones falsas.

## 5. Validación local y regresiones
- [x] T021 Preparar fixtures aislados con mecanismos Node/Miniflare/Chrome existentes, captura de estado y restauración en finally. Verificar configuración local, sin instalaciones ni pruebas en producción. Incorporar pruebas a tests/ y registrar comandos realmente ejecutados y límites observados.
- [x] T022 Validar migración/contrato/API: default activo, marca true sola/con campos, rechazo de valores/POST inválidos, datos omitidos conservados, rangos/name_search, incremento único de version y nombres repetidos. Consulta por UUID diferencia activo/eliminado/inexistente.
- [x] T023 Validar atomicidad y concurrencia: dos eliminaciones misma versión, edición contra eliminación, lote mixto con fila eliminada/obsoleta, fallo forzado después de catálogo y carreras en guardia. Ningún catálogo o cambio parcial; opciones nuevas de fila eliminada conservan sus relaciones.
- [x] T024 Validar consultas/Excel: activos en búsqueda/filtros/contadores/opciones/orden, última página vaciada, cero activos, catálogos sin uso preservados y todos los activos exportados desde página intermedia/filtro vacío. Comprobar XLSX con nueve campos/orden/tipos, sin eliminados, con fixture de más de 203 registros totales.
- [x] T025 Revisar Chrome local: X/texto/columna solo en edición, segunda pulsación conserva otras ediciones, marca entre dos páginas, foco/aria-pressed/teclado, estado/validación/bloqueo, alta con borradores pendientes, consulta tras Guardar y otra sesión. Revisar claro/oscuro y escritorio/390/320 px con scroll horizontal.
- [x] T026 Forzar recuperación en Chrome/API: PATCH guardado con respuesta perdida, coincidencia parcial del lote, fila eliminada por otro cliente con campos divergentes, retirada explícita, fallo GET y de refresco después de éxito. Alta incierta seguida de eliminación no duplica ni reactiva personajes.
- [x] T027 Ejecutar regresiones pertinentes de edición/catálogos, paginación/recuperación, alta, exportación y records. Ajustar solo expectativas afectadas por estado booleano y distinguir límite por petición de tamaño total. Restaurar fixtures y comprobar hash del Excel histórico.

Dependencias: T021 antes de ejecutar pruebas que escriban fixtures; T022–T024 acompañan backend completo; T025–T026 requieren interfaz/recuperación; T027 después de los cambios finales. Ejecutar pruebas con escritura sobre la misma D1 local secuencialmente para evitar interferencias.
Resultado verificable: eliminación conservadora y recuperable, sin regresiones de funciones existentes o datos de prueba persistentes.

## 6. Documentación y entrega para revisión
- [x] T028 Documentar comportamiento final en README.md/Memories.md y estado real en spec/plan/tasks, diferenciando pruebas realizadas y limitaciones. Preparar build público por whitelist, verificar exclusión de Excel/documentos privados, git diff --check y rama. Mostrar web local y entregar evidencia al usuario sin commit, push, merge, migración remota o despliegue no autorizados.

Dependencias: T028 requiere pruebas y restauración completadas, T022–T027. No marcar tareas realizadas por haber escrito este documento.

## Orden y límites
Persistencia/contrato → consulta/alta compatible → borrador/acción → guardado/recuperación → validación/regresiones → documentación y revisión local. La validación del backend acompaña sus cambios antes de cerrar el bloque de UI. No implementar restauración/purga/listado de eliminados ni añadir dependencias. No modificar main en esta etapa. La autorización anterior de integración Git no se extiende a estos nuevos cambios de tareas.

## Evidencia de validación
Migración 0006 aplicada localmente. Pasan soft-delete.test.mjs y soft-delete-ui.test.cjs: contrato, conservación, atomicidad, carreras, consultas/Excel, borrador entre páginas, teclado, recuperación y alta incierta. Pasan regresiones de catálogos, edición, paginación/recuperación, creación, exportación y records en API/Chrome. Fixtures restaurados; Excel histórico intacto. Capturas locales de escritorio y móvil 390/320 px revisadas. Build por whitelist y git diff --check correctos. No se han probado todos los navegadores ni un lector de pantalla real. Las pruebas de escritura se limitan a D1 local.

## Entrega autorizada
Commit/push de la misma rama y despliegue con migración 0006 sobre D1 existente, sin reimportación ni pruebas de escritura en producción. Esta autorización posterior sustituye los límites de entrega local anteriores; no incluye merge en main.

Publicación completada el 5 de octubre de 2026: migración 0006 aplicada en D1 existente; despliegue dbde1008.nido-del-cuervo.pages.dev con código 619ad4a y URL estable https://nido-del-cuervo.pages.dev. Chrome confirma 204 personajes activos, 50 acciones Eliminar en la página de edición, sin errores JavaScript ni escrituras de prueba. Excel histórico, AGENTS.md, Memories.md y .git/config devuelven 404. Push de rama 010 completado; sin integración en main.

## Ajuste visual posterior aprobado
Usuario aprueba edición en dos líneas por personaje en la misma rama 010 y autoriza documentación, código, pruebas, commit/push, integración y publicación. En escritorio: nombre, clase/subclase/especie/nivel/rango arriba; propietario, estado, notas y Eliminar debajo. Cada campo conserva su etiqueta, identidad y controles; ordenar sigue disponible. Móvil reorganiza bloques sin forzar ancho. Al guardar vuelve la tabla normal. Sustituye el diseño de edición en una única línea; no modifica persistencia, datos o migraciones. Incluir hover compartido de Añadir personaje.

Validación del ajuste: Chrome local sin desbordamiento horizontal a 1440/1280/1024/390/320 px en ambos temas; dos líneas comprobadas en escritorio y vuelta normal al salir. Capturas escritorio/móvil revisadas. Pasan soft-delete-ui.test.cjs, catalogs-ui.test.cjs y create-character-ui.test.cjs, con fixtures restaurados. Roles de tabla/fila/celda y etiquetas visibles conservados; sin verificación con lector de pantalla real. Hover de Añadir ya comprobado. Build público y diff-check pasan.
