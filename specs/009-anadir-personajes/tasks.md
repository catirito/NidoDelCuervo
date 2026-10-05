# Tareas — 009: añadir personajes

Estado: implementación autorizada, completada y validada en local. Rama local: `codex/009-anadir-personajes`, desde main local `85b82ec`. Sin commit, push, merge, PR ni publicación.

## 1. Validación y persistencia del alta
- [x] T001 Definir validador específico para { id, fields, catalogAdditions }: UUID v4, campos permitidos y obligatorios PERSONAJE/CLASS/SPECIE/PROPIETARIO. Reutilizar validateField, normalización y límites; NIVEL omitido 1, opcionales null y rango derivado. No endurecer validación de la edición existente.
- [x] T002 Preparar migración incremental 0005 para creation_requests, con character_id único/FK y huella del contenido inicial. Aplicar y comprobar exclusivamente en D1 local aislada, sin cambiar personajes previos ni reimportar Excel.
- [x] T003 Definir serialización canónica y SHA-256 del intento validado, independiente del orden de claves/altas y anterior a la resolución de grafías de catálogo concurrentes. Misma operación devuelve personaje actual; distinto contenido con el mismo UUID devuelve conflicto.
- [x] T004 Adaptar la validación de catálogos para alta, compartiendo reglas con PATCH y conservando su guardia de versiones. Crear únicamente opciones declaradas y utilizadas; resolver IDs/nombres canónicos y pertenencia de subclase dentro de la transacción.
- [x] T005 Preparar un batch atómico de catálogos, INSERT del personaje y recibo. Asignar sourceRow con MAX+1 dentro del INSERT, version 0 y name_search normalizado. Resolver carreras por unicidad/lectura del recibo, con rollback completo ante fallos.

Resultado verificable: alta íntegra y reintento sin duplicado, conservando datos anteriores.

## 2. API compartida
- [x] T006 Ampliar functions/api/characters/index.js con despacho POST /api/characters a server/create-character.js, sin alterar GET paginado ni PATCH batch.
- [x] T007 Reutilizar lectura JSON, SQL preparado, límite de cuerpo, origen permitido y cabeceras no-store/noindex. Devolver 201 inicial/200 repetición, { character, catalogs }, y errores 400/422/403/409/503 coherentes con el contrato del plan.
- [x] T008 Comprobar API local mínima/completa, obligatorios, opcionales, campos internos rechazados, límites Unicode, nivel/rango, catálogo y nombres repetidos. Verificar disponibilidad por UUID, búsqueda, paginación y otra sesión con más de 203 personajes.
- [x] T009 Verificar atomicidad ante fallo posterior a insertar catálogo, UUID concurrente idéntico/distinto contenido, altas distintas simultáneas, respuesta perdida y edición entre alta/reintento. Comprobar que personaje, recibo y opciones no quedan parcialmente guardados.

Resultado verificable: persistencia compartida y contrato de alta validados sin pruebas en producción.

## 3. Reutilización de controles
- [x] T010 Extraer solo la construcción de textControl, selectorControl y levelControl a character-controls.js con valores/opciones/estado/callback explícitos; mantener adaptadores y eventos de edición actuales.
- [x] T011 Comprobar que inputs/textarea, select con opción nueva y campo asociado, y controles de nivel conservan comportamiento, foco, datos y validación en edición. No introducir un personaje ficticio en su snapshot/lote.
- [x] T012 Conectar catálogos completos y editOptions globales al alta; mantener opciones temporales de la modal aisladas de otros borradores. Configurar required solo en sus cuatro campos, nivel 1 y subclase dependiente de clase.

Resultado verificable: alta y edición usan las mismas fábricas y reglas sin perder funciones existentes.

## 4. Modal y envío
- [x] T013 Añadir «Añadir personaje» junto a Editar y dialog/form en index.html, estilos acotados en styles.css y create-character.js. Mantener contador 008, temas y disposición adaptable de acciones.
- [x] T014 Implementar etiquetas, foco inicial, contención de foco, retorno al botón, Cancelar/Escape antes de envío y desplazamiento interno en móvil. Errores asociados a campos/región de estado; ninguna escritura al abrir o cancelar.
- [x] T015 Mantener un borrador independiente con UUID estable, bloquear doble envío y cierre durante escritura/confirmación incierta. Conservar campos ante error confirmado y congelar el intento hasta resolver una respuesta perdida.
- [x] T016 Implementar recuperación explícita por GET ids y reintento del mismo UUID/payload cuando corresponda. No crear otra operación, buscar por nombre ni sobrescribir ediciones posteriores al comprobar un alta.

Resultado verificable: formulario accesible, controles acordados y guardado recuperable.

## 5. Consulta y paquete público
- [x] T017 Tras POST confirmado, cerrar modal y anunciar éxito; recargar consulta preservando filtros/búsqueda/orden/página/tamaño y originales/versiones de borradores de edición. Conservar confirmación aunque el personaje quede fuera de la vista.
- [x] T018 Distinguir alta guardada de recarga fallida; reintentar solo GET después de un POST confirmado. Deshabilitar apertura durante carga/escritura sin descartar borradores existentes.
- [x] T019 Incluir únicamente los nuevos módulos de navegador necesarios en scripts/build-cloudflare.mjs y documentar la función en README.md con su estilo actual. Conservar exclusión de Excel/documentos privados; no modificar el módulo de exportación terminado.

Resultado verificable: alta integrada sin alterar edición, paginación, cabecera ni exportación.

## 6. Validación y revisión local
- [x] T020 Usar los mecanismos Node/Miniflare/Chrome existentes en tests/; registrar comandos realmente ejecutados. Preparar fixtures aislados y restauración para no imponer 203 como total fijo ni modificar producción.
- [x] T021 Revisar modal en escritorio/móvil y claro/oscuro: apertura, campos obligatorios, opción nueva, nivel, cancelar/Escape, teclado/foco, bloqueo de envío, error/reintento y respuesta perdida. Comprobar alta consultable desde otra sesión.
- [x] T022 Verificar borradores en varias páginas conservados al crear, consulta que oculta el alta, fallo de recarga después de éxito, búsqueda/edición del registro 204 y exportación completa mediante el contrato actual.
- [x] T023 Ejecutar regresiones pertinentes de controles, catálogos, paginación/recuperación y exportación; restaurar los datos locales de prueba y comprobar hash del Excel. Registrar resultados, evidencia y límites en este archivo.
- [x] T024 Comprobar diff/build, actualizar Memories.md y entregar vista local para revisión del usuario. No crear recursos, aplicar migraciones ni ejecutar pruebas en producción.

Resultado verificable: entrega local con evidencia proporcional; commit, push, merge, PR y publicación pendientes de autorización posterior.

## Orden y límites de ejecución
Persistencia/contrato → API validada → controles compartidos → modal → integración/paquete → validación local. Tareas de revisión de controles acompañan su extracción. No instalar herramientas ni usar agentes adicionales salvo nueva autorización. Los límites de solicitud existentes no representan el tamaño máximo del registro ni se amplían en esta spec.

## Próxima etapa
Revisión local del usuario. Commit, push, merge y publicación requieren autorización posterior.


## Evidencia de validación — 5 de octubre de 2026
- Migración 0005 aplicada mediante Wrangler `d1 migrations apply nido-personajes-local --local`, sin migraciones previas pendientes ni acceso remoto.
- `node tests/create-character.test.mjs`: obligatorios/vacíos, nivel, campos internos, Unicode, origen, alta mínima/completa, catálogos, registro 204, identidad independiente del nombre, reintento, edición posterior, carreras UUID idéntico/distinto, catálogo compartido y sourceRow único. Trigger de fallo en recibo comprueba rollback de personaje/catálogos. Restauración del snapshot completo comprobada.
- `node tests/create-character-ui.test.cjs`: Chrome local, foco inicial, Escape/Cancelar sin escritura, controles compartidos, nivel, propietario nuevo, dos borradores en páginas distintas conservados, consulta desde otra sesión, respuesta perdida recuperada sin POST adicional, bloqueo de cierre, fallo de refresco después de alta y reintento solo GET, filtro preservado, claro/oscuro y móvil 320 px.
- Regresiones `catalogs-ui.test.cjs`, `pagination-recovery-ui.test.cjs`, `export-excel-ui.test.cjs`, `export-excel.test.mjs` y `records.test.mjs` pasan. Exportación verifica más de 203 registros en fixture y consulta completa/orden/error/bloqueo en navegador.
- Node ejecutado con `/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; Chrome mediante Playwright existente, Miniflare existente en Wrangler. Sin instalaciones nuevas. Variables PLAYWRIGHT_MODULE y MINIFLARE_MODULE apuntan a esos módulos existentes.
- Build `node scripts/build-cloudflare.mjs` y `git diff --check` pasan. Paquete por lista explícita incluye dos módulos nuevos, excluye Excel y documentos privados. export-excel.js sin cambios.
- Capturas revisadas: `/private/tmp/nido-009-desktop.png` y `/private/tmp/nido-009-mobile.png`. Modal sin desbordamiento horizontal; desplazamiento interior en móvil.
- Excel SHA256: `8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f`. Fixtures de alta/catálogo retirados; regresiones restauran campos, con versiones locales que pueden avanzar.
- Límites: no lector de pantalla real ni todos los navegadores; ningún test, alta, migración o despliegue en producción. Validación compartida de límites/rangos usada por ambos flujos; no se enumeró cada combinación posible en Chrome.

## Entrega autorizada
El usuario autoriza commit, push de la rama y publicación. Aplicar únicamente migración 0005 pendiente en D1 existente; no reimportar ni ejecutar pruebas de escritura en producción. Integración en main no solicitada.

## Publicación completada
Commit 3bc888c y rama codex/009-anadir-personajes subidos y verificados con ls-remote. Solo migración 0005 pendiente aplicada en D1 remota existente, sin reimportación. Cloudflare confirmó despliegue 386a89cd.nido-del-cuervo.pages.dev, servido en https://nido-del-cuervo.pages.dev. Navegador confirma 203 registros y apertura/cancelación de modal con catálogos globales, obligatorios y nivel inicial 1. Sin crear personajes ni realizar pruebas de escritura en producción. Rama separada de main.

## Ajuste de disposición solicitado
Rango de alta a la derecha del control de nivel dentro de la misma fila, con actualización automática y aria-live. Verificado con Chrome local a 1440/320 px: alineación y límites horizontales correctos; nivel 3 muestra Cuervo blanco. Build y diff-check pasan. Sin escrituras a D1, commit, push o publicación de este ajuste.
