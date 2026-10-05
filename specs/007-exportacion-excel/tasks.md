# Tareas — exportación de personajes a Excel

Estado: desglose autorizado y elaborado. Implementación autorizada y completada; validación local del XLSX y navegador completada con API interceptada. Rama local: `codex/007-exportacion-excel`. Seguir plan.md; no publicar ni integrar en main.

## 1. Generación del archivo
- [x] Crear export-excel.js con funciones pequeñas para construir el libro y solicitar su descarga, recibiendo personajes y la biblioteca local.
- [x] Reutilizar fields de records.js; incluir los nueve encabezados visibles en una sola hoja «Personajes», excluyendo metadatos y catálogos.
- [x] Conservar NIVEL numérico, RANGO como valor, vacíos y textos intactos; establecer texto explícito sin fórmulas.
- [x] Aplicar anchuras de columnas acotadas y nombre nido-del-cuervo-personajes-AAAA-MM-DD.xlsx con fecha local del cliente.

Resultado verificable: libro generado en memoria y descargable sin solicitudes al servidor ni modificación de datos.

## 2. Botón y mensajes
- [x] Añadir «Exportar Excel» junto a «Editar» en index.html, inicialmente deshabilitado, y una región accesible propia para mensajes de exportación.
- [x] Cargar vendor/xlsx.full.min.js como script externo local antes de su uso.
- [x] Mantener foco visible y barra adaptable a móvil; ajustar styles.css solo si resulta necesario.

Resultado verificable: control accesible e integrado en la barra existente, con mensajes separados del contador y de la edición.

## 3. Coordinación con consulta y edición
- [x] Conectar el botón desde app.js al conjunto completo guardado de visibleCharacters(), exclusivamente fuera de edición, y a sortCharacters() con el criterio activo.
- [x] No usar los resultados filtrados ni leer filas de la tabla para generar el archivo.
- [x] Centralizar disponibilidad durante carga, error de carga, conjunto vacío, edición, guardado y generación; actualizarla en los eventos existentes.
- [x] Mantener disponible la exportación cuando una búsqueda no encuentra filas pero el conjunto completo contiene personajes.
- [x] Capturar errores de generación/descarga, informar sin afirmar guardado físico y restaurar disponibilidad para reintentar.

Resultado verificable: exportación de todos los personajes guardados con orden activo y sin borradores, escrituras ni solicitudes adicionales.

## 4. Salida pública
- [x] Añadir export-excel.js, vendor/xlsx.full.min.js y vendor/LICENSE a la lista explícita de scripts/build-cloudflare.mjs.
- [x] Comprobar que la salida conserva la biblioteca/licencia y excluye Excel histórico, documentos internos y archivos privados.
- [x] Actualizar README.md con el comportamiento de exportación, respetando el idioma y estilo actuales.

Resultado verificable: paquete público listo para usar el botón, sin despliegue en esta etapa.

## 5. Validación del XLSX
- [x] Añadir una prueba en tests/ siguiendo el patrón Node, assert y biblioteca local utilizado en tests/records.test.mjs, sin instalar herramientas.
- [x] Generar y releer el archivo; comprobar hoja única, encabezados, número de filas y ausencia de metadatos.
- [x] Comprobar tipos, vacíos, acentos, saltos de línea, rango como valor y textos con =, +, - y @ sin celdas de fórmula.
- [x] Verificar criterio de ordenación, desempates por sourceRow y vacíos al final con datos controlados.
- [x] Comprobar conservación del hash del Excel histórico con el mecanismo existente.

Resultado verificable: contenido y tipos comprobados sobre los bytes del archivo, no solo sobre objetos intermedios.

## 6. Validación y entrega local
- [x] Reutilizar el mecanismo de navegador de tests/character-editing-ui.test.cjs y el servidor local establecido, sin instalar dependencias ni probar producción.
- [x] Capturar una descarga real e inspeccionar el archivo con filtros, búsqueda y ordenación activos; verificar todas las filas.
- [x] Comprobar botón deshabilitado durante carga/edición/guardado y reactivado al salir; validar datos actualizados tras guardar usando interceptación local controlada o restaurando cualquier dato local de prueba.
- [x] Verificar lista completa vacía, búsqueda sin resultados, fallo de generación y reintento.
- [x] Observar las solicitudes al pulsar para confirmar ausencia de envíos del archivo o escrituras.
- [x] Revisar teclado, escritorio, móvil y consulta/edición afectadas; ejecutar las pruebas existentes disponibles pertinentes y registrar la limitación de API local sin ampliar pruebas de D1 si no se modifica.
- [x] Registrar en este documento los comandos realmente ejecutados, resultados y límites; no declarar verificaciones que no se hayan realizado.
- [x] Actualizar Memories.md con el estado final y entregar evidencia local para revisión.

Resultado verificable: entrega local con evidencia de descarga y comportamiento, sin commit, push, publicación ni integración en main en esta etapa.

## Orden de ejecución
Generación → botón → coordinación → salida pública → pruebas del archivo → validación local. Cada bloque se completa y verifica antes de la entrega; no usar agentes adicionales salvo petición del usuario.

## Evidencia de validación — 5 de octubre de 2026
Runtime Node utilizado: `/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

- `node tests/export-excel.test.mjs`: pasa; 208 filas (203 del histórico y cinco casos de texto), ida y vuelta del XLSX, nueve columnas, tipos, vacíos y ausencia de fórmulas.
- `node tests/records.test.mjs`: pasa; 203 registros, orden estable, filtros/búsqueda y hash original del Excel intacto.
- `PLAYWRIGHT_MODULE=/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/export-excel-ui.test.cjs`: pasa con Chrome instalado y servidor estático local en 8790. Descargas capturadas y releídas, 203 personajes con filtros/búsqueda, orden, error y reintento, edición, guardado simulado, teclado y tamaños 1440/390/320. Sin errores JS ni solicitudes al exportar. Captura móvil revisada en `/private/tmp/nido-export-mobile.png`.
- `node scripts/build-cloudflare.mjs`: pasa; módulo, biblioteca y licencia presentes, Excel histórico y documentos internos ausentes; inspección de la lista explícita de salida.
- `git diff --check`: pasa.

Los comandos Node anteriores se ejecutaron con el runtime indicado. La prueba de navegador intercepta GET/PATCH con datos de prueba locales y no modifica D1. No hay servidor D1 ni estado local en este checkout; `tests/character-editing.test.mjs` no pudo ejecutarse por no tener el servicio local 8788 disponible (fetch rechazado en sandbox). No se afirma regresión integral de API/D1. La descarga capturada no confirma que un usuario guarde en disco ni compatibilidad con Excel de escritorio, lectores de pantalla o todos los navegadores. No se ha publicado ni probado producción.

## Próxima etapa
Revisión del usuario. Commit, push y publicación pendientes de autorización; la rama GitHub continúa pendiente del bloqueo de revisión automática anterior.


## Validación de la integración con paginación
Usuario autoriza merge conjunto en main y publicación. Pasan tests/export-excel.test.mjs, tests/records.test.mjs, tests/pagination.test.mjs, tests/export-excel-ui.test.cjs y tests/pagination-ui.test.cjs con el runtime Node/Playwright existente. Chrome local utiliza D1 aislada para paginación y descarga real, no API simulada. La prueba de exportación confirma 203 personajes desde página 2 y vista filtrada vacía, criterio activo, GET completo sin filtros, ausencia de escrituras, errores/reintento, bloqueo durante preparación, teclado y móvil. Las pruebas de paginación restauran los datos locales modificados; versiones locales pueden avanzar. Producción no se usa para pruebas. Excel histórico intacto.

## Entrega publicada
Merge en main 5f5649e y push confirmados. Cloudflare Pages confirmó 6598ab42.nido-del-cuervo.pages.dev; URL estable https://nido-del-cuervo.pages.dev. Comprobación visual de solo lectura en navegador: botón Exportar Excel, 50 de 203 personajes y paginador Página 1 de 5. Sin escrituras de prueba, importación ni nuevas migraciones en producción. Las pruebas funcionales de descarga y paginación se ejecutaron en local. Excluidos histórico y documentos internos del paquete público.
