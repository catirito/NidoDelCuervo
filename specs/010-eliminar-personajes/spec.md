# 010 — Eliminar personajes

Estado: especificación autorizada, con las tres clarificaciones resueltas y plan preparado para revisión. Planificación autorizada y guardada en plan.md para revisión. Desglose de tareas e implementación aún no autorizados. Rama local `codex/010-eliminar-personajes`, creada antes de estos documentos desde `6657dd9`, última entrega publicada de 009. Autorización posterior: commit de documentos, integración de ramas pendientes en main y push a GitHub. Implementación, migraciones y publicación de 010 no autorizadas.

## Objetivo
Permitir retirar personajes de la lista mediante una eliminación lógica pendiente hasta guardar la edición. Conservar íntegramente el registro en D1, marcándolo con `is_deleted = true`, sin borrar físicamente sus datos ni modificar el Excel histórico.

## Requisitos confirmados
- En modo edición, cada personaje muestra a su derecha una pequeña X roja acompañada del texto «Eliminar».
- Ajustar el rojo a la presentación y los temas existentes, manteniendo el texto visible y la accesibilidad por teclado; el color no es la única señal de la acción.
- Pulsar «Eliminar» marca una eliminación pendiente. No escribir en D1 al pulsar ni retirar definitivamente el personaje antes de guardar.
- Guardar la edición aplica las eliminaciones pendientes. Si el mismo personaje tiene campos editados, se persisten esos cambios junto con `is_deleted = true` en el mismo lote. Por ejemplo, el nombre nuevo queda conservado aunque el personaje desaparezca de la lista.
- Pulsar «Eliminar» una segunda vez antes de guardar quita la marca de eliminación pendiente y conserva los demás cambios de edición. Alterna únicamente la marca pendiente; no restaura registros ya eliminados.
- La cancelación de una eliminación pendiente se realiza con esa segunda pulsación. No añadir un botón Cancelar global por este requisito.
- La eliminación es lógica: conservar absolutamente todos los datos del personaje, incluidos los cambios de campos guardados en ese lote, y establecer la marca de negocio `is_deleted` a verdadero.
- Los personajes con `is_deleted = true` no aparecen en la lista ni en el Excel exportado. La exportación contiene solamente personajes activos.
- No añadir restauración, purga, listado de eliminados ni otras funciones no solicitadas.

## Estado actual comprobado
- `editing.js` mantiene borradores por UUID y campo, conserva los originales y sus versiones entre páginas y alterna el botón «Editar» a «Guardar».
- Guardar usa `PATCH /api/characters/batch` con UUID, versión esperada y cambios; el servidor valida versiones y guarda el lote de forma atómica. Los errores conservan el borrador y requieren actualizar/revisar antes de reintentar.
- No existe Cancelar para la edición de la tabla. El botón «Cancelar» actual pertenece exclusivamente a la modal de alta y no descarta borradores de edición. La cancelación de la marca pendiente queda resuelta mediante una segunda pulsación de «Eliminar», sin añadir Cancelar global.
- La tabla termina actualmente en Notas; no hay columna de acciones de eliminación.
- Las migraciones actuales llegan a 0005; no existe `is_deleted`. El esquema y la migración incremental se definirán al autorizar el plan, conservando los registros actuales como activos.
- GET sirve páginas, búsquedas, filtros, contadores, opciones globales y consultas por UUID usadas para reconciliar borradores. Exportar Excel consulta todos los registros mediante `pageSize=all`. La marca debe tratarse coherentemente en estas rutas; su contrato detallado aún no está definido.
- D1 es la fuente activa compartida. Excel histórico permanece intacto, privado y sin reimportaciones.

## Reglas existentes que se conservan
- Identidad por UUID; nombres repetidos no implican el mismo personaje.
- Ningún guardado automático al editar, marcar o cambiar de página.
- Mantener detección de conflictos, atomicidad del lote y recuperación de respuesta perdida; no sobrescribir cambios ajenos ni confirmar una eliminación no guardada.
- Mantener consulta, paginación, alta, exportación y catálogos existentes salvo la exclusión confirmada de personajes eliminados en la lista y el Excel. Exportar sigue incluyendo todos los personajes activos guardados, independientemente de la página, filtros o búsqueda, con los nueve campos y el orden activo.
- La acción conserva campos, UUID, orden interno y relaciones del personaje. La actualización de versión necesaria para concurrencia se concretará en el plan y no sustituye ni vacía datos de negocio.
- Conservar la ausencia de cuentas/autenticación acordada para la web; no introducir permisos o servicios nuevos en esta spec.

## Clarificaciones resueltas
- Una segunda pulsación de «Eliminar» retira únicamente la marca pendiente y conserva otras ediciones; no añadir Cancelar global ni restauración.
- Guardar persiste juntos los cambios de campos y la marca de eliminación del personaje.
- Lista y Excel excluyen todos los personajes con `is_deleted = true`; la exportación contiene únicamente activos.

## Propuestas para el plan, aún no confirmadas
- Mantener las filas marcadas visibles, con una señal textual de eliminación pendiente, hasta Guardar o retirar/cancelar la marca; conservar esas marcas entre páginas.
- Filtrar activos en la consulta normal y sus contadores/filtros para que la paginación no tenga huecos, preservando los catálogos independientes aunque queden sin uso. Reajustar la página cuando desaparezca su última fila, conservando búsqueda, filtros, orden y tamaño.
- Distinguir, en la reconciliación de borradores y de altas, un personaje eliminado de uno inexistente. No ofrecer restaurarlo ni sobrescribirlo mediante un reintento.
- El detalle visual, el contrato de API y la representación de booleano en D1 quedan para planificación; no crear un endpoint o método DELETE en esta etapa.

## Criterios de aceptación
1. «Eliminar», con X roja y texto, está disponible a la derecha de cada personaje en modo edición y se opera con teclado en ambos temas y móvil.
2. Marcar un personaje no realiza ninguna escritura y queda pendiente hasta Guardar; cambiar de página no aplica ni pierde la marca.
3. Al guardar correctamente, D1 conserva los datos y marca `is_deleted = true`; la consulta de la lista deja de mostrar ese UUID, también desde otra sesión.
4. Pulsar «Eliminar» de nuevo antes de guardar retira solo esa marca, conserva los demás cambios del borrador y no escribe en D1. Guardar después no elimina ese personaje; no se añade Cancelar global.
5. La eliminación de un personaje no afecta a otros con el mismo nombre.
6. Los conflictos, errores y reintentos no producen borrados físicos, pérdidas de datos, guardados parciales ni confirmaciones falsas.
7. Si se edita el nombre u otro campo de un personaje y se marca para eliminar, Guardar persiste los cambios y `is_deleted = true` juntos en el lote, sin descartar los campos editados ni borrar los restantes.
8. Paginación, contadores y consulta siguen siendo coherentes al ocultar eliminados. El Excel no contiene ningún personaje con `is_deleted = true` y mantiene todos los activos guardados, aunque estén fuera de la página o de los filtros actuales.
9. No se modifica ni publica el Excel histórico; no se implementan restauración o purga.

## Próxima etapa
Revisar plan.md, preparado tras autorización de planificación. Las tres clarificaciones están resueltas; desglose de tareas e implementación siguen sin autorización. No modificar código, esquema o datos.
