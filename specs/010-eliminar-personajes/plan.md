# Plan — 010: eliminar personajes

Estado: implementación y validación local completadas en codex/010-eliminar-personajes. Usuario autoriza commit, push y publicación en producción el 5 de octubre de 2026; integración en main no solicitada en esta entrega.

## Resultado y alcance
Añadir al extremo derecho de cada fila, solo durante edición, una pequeña X roja y «Eliminar». La acción alterna una marca local; la segunda pulsación la retira sin perder campos editados. Guardar persiste todos los cambios válidos y las marcas en el mismo lote atómico. El registro se conserva en D1 y desaparece de lista y exportación tras `is_deleted = true`.

Mantener HTML/CSS/JavaScript separados, sin frameworks, dependencias nuevas, comentarios en código, autenticación adicional, restauración, purga o reimportación del Excel. No añadir Cancelar global. La implementación y pruebas se harán primero con D1 local aislada; ninguna prueba de escritura en producción.

## 1. Persistencia y compatibilidad
- Añadir migración incremental `migrations/0006_character_soft_delete.sql`: columna `is_deleted INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1))` en characters. En D1, 0 representa falso y 1 verdadero; usar booleanos JSON en el contrato.
- Todos los registros existentes y las nuevas altas quedan activos por defecto. No reconstruir registros ni renumerar sourceRow. Conservar UUID, nueve campos, name_search, relaciones de catálogo y recibos creation_requests.
- Mantener version como control de concurrencia: cada guardado válido incrementa una vez la versión de la fila, incluida una eliminación con campos editados. La marca no es un campo de negocio editable de los formularios de alta/texto/nivel.
- No añadir índice por una marca booleana sin evidencia de necesidad; conservar la escala y SQL existentes.

## 2. Contrato del lote y guardado atómico
Ampliar el PATCH existente `/api/characters/batch`, sin crear endpoint DELETE. Conservar `{ changes, catalogAdditions }` y cada cambio `{ id, expectedVersion, fields }`. Permitir adicionalmente `fields.is_deleted: true`; aceptar exclusivamente booleano true si la clave está presente. Rechazar false, null, números y texto para impedir restauración desde API. Un borrador cuya marca se retire omite la clave, nunca envía false. El resto de fields usa las reglas actuales.

Un cambio puede contener solo la marca, solo campos actuales, o ambos. Mantener UUID únicos, versión válida, límites actuales del lote/cuerpo y de los campos, origen, SQL preparado y cabeceras existentes. No aumentar el límite de 203 cambios como efecto de esta spec: es un límite por petición, no del total de personajes.

- Extender validación específica del PATCH en server/characters.js; no añadir is_deleted a editableFields compartido con el alta.
- En updateBatchSql, actualizar is_deleted solo cuando se solicite; preservar campos omitidos. Nombre/nivel editados siguen actualizando name_search/rango antes de ocultar la fila.
- Validar que todas las filas objetivo existen, están activas y tienen la versión esperada. El UPDATE y la guardia conjunta deben comprobar las tres condiciones, no solo la lectura previa.
- Aplicar la misma condición de actividad/versión en la guardia de catalogWrites para PATCH. Si una fila cambia o se elimina entre la lectura y el batch, no insertar opciones ni actualizar ninguna fila del lote.
- Mantener en el mismo batch catálogo, actualización y lectura del resultado. Las opciones nuevas utilizadas por una fila que se guarda como eliminada también se persisten: los campos editados deben conservar su grafía/relaciones válidas.
- Una fila ya eliminada no acepta ediciones ni otra eliminación; responder conflicto 409 con UUID identificados y aviso de actualización/revisión. Una fila físicamente inexistente conserva 404. Validaciones mantienen 400/422 y servicio 503. No considerar una respuesta 409 como éxito.
- Responder 200 con characters y catalogs como actualmente, incluyendo el estado is_deleted booleano para las filas guardadas. El resultado debe incluir las eliminadas por el lote aunque la consulta normal ya las oculte.

## 3. Consulta de activos y exportación
En server/query.js, definir una condición de activo coherente para la consulta normal:
- Excluir is_deleted=1 de páginas, pageSize=all, búsqueda, filtros, ordenación preliminar, comprobación de claves de búsqueda, totalMatches y totalRecords.
- Obtener filterOptions y editOptions globales solo de personajes activos. Eliminar una fila no borra catálogos classes/subclasses/species: los selectores de catálogo conservan opciones independientes del uso.
- Aplicar la misma condición en ordenación preliminar y metadatos para evitar reintentos espurios de la comparación de opciones.
- Mantener la corrección existente de página efectiva cuando la última página queda vacía; conservar filtros, búsqueda, orden y tamaño. Con cero activos, contador vacío y exportación deshabilitada por totalRecords=0.
- Normalizar is_deleted a booleano al serializar respuestas, sin incorporarlo a los nueve campos de tabla o Excel.

La exportación seguirá consultando GET pageSize=all con el orden activo y sin filtros/búsqueda. Al devolver solo activos y contarlos igual, la comprobación actual de integridad del Excel sigue siendo válida. No cambiar export-excel.js ni su formato, columnas, tipos o descarga exclusivamente en cliente.

### Consulta por UUID para recuperación
Conservar GET `?ids=...` como consulta acotada de reconciliación, sin parámetros de listado de eliminados. Devolver los UUID solicitados existentes en characters con sus campos, versión y estado booleano, incluso si fueron eliminados; missingIds contiene solo los físicamente ausentes. Los metadatos del resto del registro siguen derivados de activos. No convertir esta respuesta en filas visibles ni ofrecer restauración. Permite contrastar el contenido de un guardado incierto sin inventar equivalencias por nombre.

## 4. Borrador e interacción en edición
En editing.js, integrar la marca como propiedad is_deleted del borrador por UUID, con validación propia:
- Alternar solo esa propiedad al pulsar. Retirarla mantiene otros fields; quitar la entrada del Map únicamente si ya no queda ningún cambio.
- Retener snapshot/versiones y marcas entre páginas como ocurre con los campos actuales. No marcar personajes por posición, nombre o índice de página.
- Mantener visible una fila marcada de la página actual mientras siga la edición, con una señal textual «Eliminación pendiente». Mantener los controles de campos operativos para guardar los cambios confirmados junto a la marca.
- Incluir en el estado accesible el total de personajes pendientes y cuántos están marcados para eliminar; una misma fila cuenta una sola vez en el total.
- No emitir PATCH al alternar. Guardar valida todos los campos, incluso los de filas marcadas; eliminar no debe permitir persistir datos inválidos.
- Bloquear acciones durante carga/guardado y respetar los bloqueos actuales por revisión pendiente. Conservar la protección beforeunload si hay cualquier borrador, también solo eliminaciones.
- Tras éxito, vaciar los borradores del lote, salir de edición y recargar consulta. No filtrar el resultado PATCH antes de confirmar qué UUID se guardaron.

### Disposición y accesibilidad
En index.html y app.js, agregar una columna de acciones a la derecha de Notas solo en edición, con encabezado accesible «Acciones». Ocultar encabezado y celdas fuera de edición, conservando la tabla de nueve campos. Añadir la celda al renderizado sin tocar los nueve campos de records.js.

Construir el botón en editing.js con UUID, X decorativa aria-hidden y texto visible «Eliminar». Usar aria-pressed para expresar marca y nombre accesible «Eliminar [nombre]»; el texto de pendiente explica que otra pulsación retira la marca. No reemplazarlo por una acción de restauración. Tras alternar y renderizar, devolver foco al botón del mismo UUID. La fila marcada sigue disponible para la segunda pulsación.

En styles.css, usar un rojo de texto/icono adaptado a claro/oscuro con contraste suficiente, botón discreto y área de interacción adecuada. Foco visible; ninguna animación o decoración nueva. Mantener scroll horizontal en móvil para llegar a la última columna, y conservar la cabecera y contador de 008. Seguir la orientación visual existente de frontend-skill sin rediseñar la tabla.

## 5. Conflictos y respuestas perdidas
Extender refreshDraft de forma explícita, usando la consulta por UUID:
- **Registro activo:** reconciliar campos ya coincidentes como ahora; mantener la marca pendiente si el servidor sigue activo. Si cambió version, mostrar los datos actuales y exigir revisión antes de Guardar. No borrar otros borradores.
- **Registro eliminado con borrador de eliminación:** comparar también todos los campos editados enviados. Si coinciden, retirar esa entrada como estado ya guardado, sin enviar otra eliminación. No afirmar que se confirmó el lote completo por encontrar solo una marca o una fila coincidente.
- **Registro eliminado con campos no coincidentes, o con borrador solo de edición:** informar que ya está eliminado y no se pueden aplicar esas propuestas. Conservar el borrador bloqueado para revisión y permitir retirarlo explícitamente mediante el mecanismo existente de retirar borradores, con texto adecuado. No cambiar su marca a falso, renovar su versión para reenviar ni crear una copia.
- **Registro físicamente ausente:** conservar el tratamiento actual de borrador faltante y retirada explícita.

Después de reconciliar, las filas eliminadas no deben reaparecer en visibleCharacters por estar retenidas en snapshot; separarlas de la página visible conservando, cuando corresponda, los datos necesarios para explicar/retirar su borrador. Si quedan cambios activos, Guardar se habilita solo tras resolver las entradas bloqueadas. Un error de consulta mantiene todo el borrador.

### Compatibilidad con alta recuperable de 009
Los recibos de alta se conservan y un reintento de POST con mismo UUID/huella no inserta ni reactiva personajes. Añadir is_deleted booleano a creationResponse; mantener la consulta por UUID capaz de confirmar que el alta existió aunque luego se eliminara. Adaptar únicamente el mensaje de confirmación de create-character.js cuando reciba un registro eliminado: «El personaje se guardó y ahora está eliminado». Cerrar y refrescar sin mostrarlo ni reenviar otro POST. El formulario no acepta is_deleted y toda alta nueva sigue activa. No añadir restauración o listado de historial como consecuencia de esta recuperación.

## 6. Archivos previstos
- `migrations/0006_character_soft_delete.sql`: única ampliación de esquema.
- `server/characters.js`, `server/catalogs.js`, `functions/api/characters/batch.js`: validación y guardia atómica de activos.
- `server/query.js`: listado/contadores/opciones de activos y reconciliación por UUID.
- `server/create-character.js`, `create-character.js`: estado eliminado en confirmación de alta recuperable.
- `editing.js`, `app.js`, `index.html`, `styles.css`: borrador, acción de fila, estado accesible y recuperación.
- `README.md`, `Memories.md`, documentos 010: comportamiento y evidencia al autorizar implementación.
- `tests/`: pruebas de eliminación/API y Chrome reutilizando mecanismos actuales. No modificar build salvo que la implementación necesite un módulo realmente nuevo; el plan no propone ninguno.

## 7. Validación prevista, exclusivamente local
Usar Node, Wrangler local, Miniflare y Chrome/Playwright ya disponibles, con fixtures y restauración al terminar; no instalar herramientas. Al implementar, registrar comandos que se ejecuten realmente, no anticipar resultados.

- Migración: todos los registros previos activos, campos/UUID/sourceRow/version intactos; alta nueva activa y booleano JSON correcto. Verificar hash del Excel histórico.
- API: marca true sola y con campos editados; rechazo de false/null/0/1/texto/claves de alta; datos conservados; nombres repetidos; lote mixto; validación vigente; marcas no aceptadas en POST.
- Atomicidad: dos clientes con versión igual; edición contra eliminación; lote con fila ya eliminada; fallo forzado después de catálogo; ningún catálogo o cambio parcial. Comprobar incremento de version una sola vez.
- Consultas: lista/paginación/búsqueda/filtros/opciones/orden sin eliminados, página final vaciada, cero activos, GET ids diferenciando eliminado de inexistente, catálogos sin uso conservados.
- Excel: omitir eliminados en exportación completa desde página intermedia o filtro vacío, conservar nueve campos/orden/descarga local y comparar con totalRecords de activos. Fixture con más de 203 registros para separar tamaño total y límite por lote.
- Chrome: entrar/salir de edición, X y texto a la derecha, marcar/desmarcar, foco y aria-pressed, otras ediciones conservadas, dos páginas, alta con borradores pendientes, bloqueo durante guardado, recarga y otra sesión sin la fila.
- Recuperación: respuesta PATCH perdida con campos y eliminación, coincidencia parcial, eliminación por otro cliente con campo divergente, retirada explícita de borrador bloqueado, fallo de recarga tras éxito y reintento GET. Alta incierta seguida de eliminación no duplica ni reactiva.
- Visual: claro/oscuro, escritorio y 390/320 px, teclado y desplazamiento horizontal. No afirmar compatibilidad con todos los navegadores o lector de pantalla real si no se prueba.
- Regresiones pertinentes: edición de campos/catálogos, paginación/recuperación, alta, exportación y records. Ajustar las aserciones de forma que el histórico de 203 no sea un límite funcional.
- Build por whitelist pública, exclusión de Excel/documentos internos y git diff --check. No publicar ni migrar remotamente en esta etapa.

## Próxima etapa
Revisión de tasks.md y autorización de implementación. Implementación, migración local y pruebas funcionales de 010 siguen pendientes de autorización, al igual que publicación. La autorización posterior de commit/merge/push se limita a integrar entregas existentes y estos documentos, sin implementar 010.

## Ajuste visual posterior aprobado
Usuario aprueba edición en dos líneas por personaje en la misma rama 010 y autoriza documentación, código, pruebas, commit/push, integración y publicación. En escritorio: nombre, clase/subclase/especie/nivel/rango arriba; propietario, estado, notas y Eliminar debajo. Cada campo conserva su etiqueta, identidad y controles; ordenar sigue disponible. Móvil reorganiza bloques sin forzar ancho. Al guardar vuelve la tabla normal. Sustituye el diseño de edición en una única línea; no modifica persistencia, datos o migraciones. Incluir hover compartido de Añadir personaje.
