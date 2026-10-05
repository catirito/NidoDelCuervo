# Plan — 009: añadir personajes

Estado: planificación autorizada y preparada; tareas desglosadas tras autorización en tasks.md. Solo documentación; no implementación, commit, push, merge, PR ni publicación. Rama local `codex/009-anadir-personajes`, basada en main local `85b82ec` con el último merge de 008. No basarse en el checkout anterior de paginación.

## 1. Arquitectura comprobada
D1 es la fuente activa compartida. GET /api/characters en functions/api/characters/index.js ya devuelve una página, catálogos completos y opciones globales. PATCH /api/characters/batch guarda borradores mediante server/characters.js y server/catalogs.js. La interfaz combina app.js (consulta/paginación), editing.js (borradores y controles) y character-fields.js/rank.js/catalog-values.js (reglas).

characters exige id UUID, NIVEL entero, RANGO, sourceRow entero único, version inicial 0 y name_search. La búsqueda usa minúsculas españolas y el orden desempata por sourceRow. El Excel ya no es la fuente de consulta. El módulo de exportación terminado permanece sin modificaciones; su GET pageSize=all incluirá las altas cuando existan.

Mantener una sola carpeta canónica 009. El borrador 008-anadir-personajes de otro worktree no se aplica ni se borra desde esta tarea; 008-cabecera-listado ya ocupa ese número. No crear otra conversación ni enviar mensajes a otras tareas desde esta preparación.

## 2. Modal y controles compartidos
Añadir botón junto a Editar y estructura dialog/form en index.html, estilos acotados en styles.css y lógica de alta en create-character.js. Actualizar el build público explícito para los módulos nuevos cuando se implemente. Conservar contador separado de la barra según 008 y todas las acciones actuales.

Dirección visual: misma superficie, tipografía, acentos y tamaños de controles. Etiquetas claras, formulario compacto, un envío principal «Guardar personaje» y «Cancelar». Se conservan hover y foco existentes; sin adornos, imágenes o animaciones nuevas. En móvil, ancho dentro de la ventana y desplazamiento interno. Orientación: `.agents/skills/frontend-skill/SKILL.md`, ya consultada y adaptada al alcance.

Las fábricas actuales textControl, selectorControl y levelControl dependen de snapshot, draft, opciones y eventos de editing.js. Extraer únicamente la construcción de controles a un módulo común (character-controls.js) que reciba valor, opciones, estado y callback explícitos; conservar adaptadores de edición. Reutilizar inputs/textarea, select con opción nueva y campo de texto asociado, y output con botones de subir/bajar nivel. No simular un personaje existente ni introducir el alta en el lote de edición para reutilizar sus funciones.

Usar catálogos completos y editOptions globales del GET existente; no derivar propietario/estado de la página visible. Las opciones temporales creadas dentro de la modal pertenecen solo a ese formulario; no persistir ni mezclar propuestas de otro borrador. Aplicar required en PERSONAJE/CLASS/SPECIE/PROPIETARIO solo para alta. La opción vacía de los selects conserva su presentación, pero no permite guardar un obligatorio. Nivel inicial 1; rango mostrado como valor derivado si se presenta. Subclase opcional filtrada por clase y vaciada si cambia a una clase incompatible.

Mantener el borrador de alta en memoria mientras está abierta la modal. Abrir puede coexistir con el modo edición; el fondo modal impide operar la tabla y el alta no guarda ni borra los borradores. Deshabilitar apertura durante carga o escritura pendiente. Durante envío bloquear otro envío y cierre hasta conocer resultado; ante error confirmado sin escritura reactivar corrección/cancelación. Ante respuesta incierta conservar UUID/payload y ofrecer comprobación explícita antes de volver a editar el intento.

Accesibilidad: nombre de dialog, etiquetas de controles, foco inicial en nombre, contención de foco nativa y retorno al botón. Escape cancela antes de enviar; no guardar al cerrar. Error local asociado al campo o estado accesible del formulario.

## 3. Contrato propuesto
Extender functions/api/characters/index.js para despachar GET existente y POST /api/characters, conservando PATCH batch. Separar creación en server/create-character.js para no cargar la función de consulta con validación/escritura.

Cuerpo: { id, fields, catalogAdditions }. id es un UUID v4 generado una sola vez en el navegador para ese intento. fields admite exclusivamente PERSONAJE, CLASS, SUBCLASS, SPECIE, NIVEL, ESTADO, PROPIETARIO, NOTAS. NIVEL omitido equivale a 1; opcionales omitidos/vacíos a null. No aceptar RANGO, sourceRow, version ni name_search desde el visitante. catalogAdditions conserva la estructura actual de clases, especies y subclases con className/name; crear solo opciones declaradas que use el personaje.

Reutilizar validateField, rankForLevel, catalogKey/catalogName y normalización de opciones, con un validador específico de alta para los cuatro obligatorios. Conservar límites 50/2.000 y reglas Unicode/espacios actuales sin endurecer PATCH. Compartir validación de pertenencia y nombres canónicos de catálogo con adaptadores de creación; catalogWrites actual tiene guardia de versiones de personajes existentes y no sirve directamente para INSERT. No aplicar expectedVersion a un personaje que aún no existe.

Respuesta inicial 201: { character, catalogs }, personaje persistido con sus nueve valores, id, sourceRow y version. Repetición de la misma operación confirmada: 200 con el mismo UUID y su estado actual, sin restaurar datos iniciales. Errores coherentes con server/http.js: 400 forma inválida, 422 valores/relaciones, 403 origen distinto, 409 UUID usado para otra operación, 503 indisponibilidad/resultado no confirmado. Reutilizar readJson y su límite 3 MiB, no-store/noindex y comprobación de Origin de PATCH; no añadir autenticación.

## 4. Atomicidad, reintentos y concurrencia
Proponer migración incremental 0005 para un recibo de alta por UUID (creation_requests: character_id único relacionado con characters.id y huella de contenido validado inicial). La huella se calcula con serialización canónica y SHA-256 sobre el intento normalizado antes de resolver grafías de catálogo concurrentes; ordenar campos/altas para que el orden de claves JSON no cambie la comparación. Usar Web Crypto existente, sin dependencias. El recibo distingue un reintento de la misma operación de un UUID reutilizado con otro contenido y sigue siendo válido aunque el personaje sea editado después.

Al recibir POST, validar y comprobar si ya existe un recibo: si coincide devolver el personaje actual (200); si difiere devolver conflicto. Un id de personaje antiguo sin recibo nunca autoriza sobrescribirlo. Congelar UUID y payload desde el primer envío hasta resolver su resultado.

Guardar catálogos usados, personaje y recibo en un único D1 batch transaccional con sentencias preparadas. Resolver IDs/grafías canónicos de catálogo dentro de SQL, conservando unicidad de name_key y de (class_id, name_key). Insertar personaje después de sus catálogos y recibo después del personaje para respetar la FK. Cualquier fallo revierte todo, incluidas opciones nuevas. Ante carrera con el mismo UUID, la restricción única aborta el lote perdedor; leer después el recibo ganador y comparar para devolver éxito equivalente o conflicto sin escrituras parciales.

Asignar sourceRow mediante MAX(sourceRow)+1 dentro del propio INSERT, no con una lectura independiente en JavaScript. La operación transaccional serializada evita colisiones entre altas distintas; la restricción UNIQUE lo verifica. Mantener filas anteriores y su orden, version inicial 0, rango derivado de nivel y name_search con toLocaleLowerCase('es'). No reimportar ni renumerar personajes.

La documentación oficial confirma que un batch de D1 revierte la secuencia si falla una sentencia: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch. Verificación documental realizada para este plan; el SQL y sus carreras siguen pendientes de pruebas locales en implementación.

Si se pierde la respuesta, consultar GET /api/characters?ids=UUID para comprobar persistencia. Si existe, mostrar confirmación con datos actuales y no reenviar una alta nueva. Si no existe o la primera petición puede seguir en curso, reintentar únicamente el mismo UUID/payload idempotente. No buscar por nombre ni generar otro UUID para solucionar incertidumbre. Un formulario nuevo tras éxito/cancelación confirmada sí obtiene un UUID nuevo.

## 5. Integración con el registro compartido
Tras confirmar POST, cerrar modal, devolver foco y anunciar «Personaje guardado». Recargar la consulta actual a través de app.js conservando búsqueda, filtros, orden, página y tamaño. setCharacters ya retiene originales de UUID con borradores pendientes; no usar la respuesta de alta para renovar sus versiones silenciosamente. Refrescar catálogos/opciones globales desde GET y permitir ajuste normal de página fuera de rango.

El personaje puede quedar fuera de los filtros o en otra página por nivel/orden; la confirmación de guardado se mantiene sin forzar cambios de consulta. Si el POST está confirmado pero falla el GET posterior, informar «Personaje guardado; no se pudo actualizar la vista» y reintentar solo la lectura, no crear otro registro.

Una segunda sesión consulta la misma D1 y verá el alta al recargar/consultar. No añadir polling ni WebSockets. La exportación seguirá pidiendo el conjunto completo guardado mediante su contrato actual; no cambiar su implementación terminada.

## 6. Crecimiento del registro y compatibilidad
El total de personajes deja de ser necesariamente 203. queryCharacters ya calcula totales dinámicos y pageSize=all; sourceRow se asigna para nuevas filas. No introducir restricciones que impidan el registro 204 ni nombres repetidos. Confirmar búsqueda, paginación y edición individual del nuevo personaje.

Hay límites de 203 por lote/consulta de UUID y por listas de altas de catálogo en server/characters.js, server/query.js y server/catalogs.js. Son límites de solicitud, no capacidad total de characters; no ampliarlos silenciosamente en esta spec. Probar alta cuando hay más de 203 registros y operaciones individuales dentro de los límites existentes. Las pruebas actuales que esperan 203 deben conservar un fixture aislado y restaurado, sin tratar ese número como invariante de producción.

## 7. Validación posterior prevista
Reutilizar los mecanismos Node, Miniflare y Chrome/Playwright existentes, sin instalar herramientas. Tareas detalladas en tasks.md; registrar los comandos realmente ejecutados cuando se autorice implementar.

- Validación de alta mínima/completa, campos desconocidos, cuatro obligatorios, Unicode y límites, opcionales null, niveles/rangos, nombres repetidos y catálogo/dependencia clase-subclase.
- API/D1 aislada: persistencia y lectura desde otra sesión, UUID/version/name_search/sourceRow, opciones nuevas, rollback incluyendo catálogo/recibo, doble envío, pérdida de respuesta, mismo UUID con otro payload y edición entre alta/reintento. Altas simultáneas con sourceRows distintos y catálogos equivalentes.
- Navegador local: apertura, cancelación, labels/foco/Escape, errores conservando datos, controles idénticos a edición, valor nuevo y nivel, preparación/bloqueo, recarga fallida tras POST confirmado y alta fuera de filtros/página.
- Compatibilidad: borradores en varias páginas conservados al crear, consulta de más de 203 personajes, edición del nuevo registro, búsqueda Unicode, exportación completa sin cambiar su módulo y cabecera 008. Ambos temas y móvil.
- Restaurar los datos de prueba de D1 local y verificar hash del Excel. Ninguna prueba, migración ni creación de recursos en producción en esta etapa.

## 8. Entrega y decisiones pendientes
No hay una decisión de producto bloqueante para revisar el plan. Contrato POST, recibo 0005, interacción con borradores y recarga conservando consulta son propuestas del plan; todavía no son código implementado ni resultados validados.

Desglose autorizado y guardado en tasks.md. Con autorización de implementación, trabajar en esta rama y entregar en local. Commit, push, merge, PR y publicación requieren autorización posterior. La prohibición explícita de push prevalece sobre la regla general de crear rama en GitHub; su creación remota queda aplazada, no bloquea guardar los documentos locales.
