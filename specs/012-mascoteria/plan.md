# Plan de implementación — 012 Mascotería

> Plan ejecutado y validado en local. Las comprobaciones, los comandos y los límites constan en [tareas](tasks.md).

**Objetivo.** Añadir una página de Mascotería con navegación compartida, consulta, edición pública y exportación.

**Arquitectura.** Cloudflare Pages sirve dos páginas con HTML, CSS y JavaScript separados. Pages Functions ofrece una API de Mascotería respaldada por D1. Los propietarios se vinculan por identificador a la tabla de personajes.

**Referencia.** [Especificación 012](spec.md).

## 1. Datos e importación

- Añadir `migrations/0007_mascoteria.sql` con mascotas y una tabla de vínculos a personajes. Cada mascota tendrá identificador estable, nombre obligatorio, animal y ubicación opcionales, versión y marca de baja lógica. Un índice único por pareja mascota y personaje impide duplicados. Conservar los vínculos al dar de baja cualquiera de los dos registros.
- Preparar `scripts/import-mascoteria.mjs` para generar un informe previo a la escritura y una carga única. Resolver propietarios contra el entorno D1 de destino usando las equivalencias de la spec. Una discrepancia o ambigüedad detiene la carga y se incluye en el informe. La carga no forma parte del despliegue ni sobreescribe ediciones posteriores al repetirse.
- Identificar las entradas por bloque, columna y fila de origen. El informe concilia 55 registros: 24 en Mascotería, 7 fuera del gremio, 4 en Establos y 20 sin ubicación. Excluir K8, A25, A26 y la nota de S18. Conservar los nombres repetidos como registros distintos. Confirmar seis entradas sin propietario y los tres vínculos de Tinka.
- Importar únicamente los campos de datos. Conservar el Excel original fuera del paquete público.
- Prueba prevista en `tests/mascoteria-import.test.mjs`. Cubrir el recuento, exclusiones, propietario ambiguo y repetición de la carga después de editar una mascota.

## 2. API de Mascotería

- Añadir `functions/api/mascoteria/index.js` para consulta y alta y `functions/api/mascoteria/batch.js` para guardar cambios y bajas. Separar consultas y escrituras en `server/mascoteria-query.js` y `server/mascoteria-write.js`. Reutilizar las respuestas de `server/http.js` y los patrones existentes de paginación, idempotencia de alta y control de versiones.
- La consulta devuelve mascotas activas y sus propietarios con identificador y nombre oficial. El catálogo para nuevas asignaciones contiene personajes activos. La unión para mostrar propietarios existentes incluye personajes dados de baja. Los filtros de propietario, animal y ubicación se combinan con la búsqueda. El filtro de propietario comprueba pertenencia y cada mascota aparece una vez. Admitir filtros explícitos de campos vacíos. Ordenar antes de paginar, con la ubicación «Mascotería» primero y el orden alfabético por Animal dentro de cada grupo. Los animales vacíos quedan al final del grupo y los empates se resuelven por Nombre.
- El alta requiere un nombre con contenido y acepta una lista vacía de propietarios. La edición puede conservar o retirar un propietario dado de baja que ya estaba vinculado. Validar en el servidor que las nuevas asignaciones correspondan a personajes activos. Guardar campos, vínculos y baja en una operación atómica con comprobación de versión. Rechazar archivos y campos de imagen en las escrituras públicas.
- Prueba prevista en `tests/mascoteria-api.test.mjs` con el patrón de Miniflare del registro. Cubrir alta con solo nombre, reintento, conflicto sin cambios parciales, propietario dado de baja, filtros y solicitudes directas con campos de imagen.

## 3. Página y exportación

- Añadir `mascoteria.html` y `mascoteria.js`. Incorporar el menú en ambas páginas, mantener los temas y reutilizar estilos del registro. La página presenta tabla, búsqueda, filtros, paginación y controles públicos de alta, edición y baja. El select de propietarios añade cada personaje elegido a una lista desde la que se puede quitar. El select se restablece tras cada elección y omite los personajes ya añadidos. Su etiqueta comparte el estilo de los otros campos del diálogo. Los desplegables de Animal y Ubicación ofrecen los valores existentes, una opción vacía y una opción para introducir un valor nuevo. El modo de edición prepara cada cambio en un diálogo y guarda todos los borradores en un solo lote. Mantener borradores al paginar o ante un fallo de guardado.
- Añadir la página y sus scripts a `scripts/build-cloudflare.mjs`.
- Exportar desde el navegador con el mecanismo XLSX existente. La descarga incluye Nombre, Propietario, Animal y Ubicación de todas las mascotas activas guardadas, con independencia de la consulta visible. Una mascota ocupa una fila con todos sus propietarios oficiales. La descarga omite imágenes y enlaces internos.
- Pruebas previstas en `tests/mascoteria-ui.test.cjs` y `tests/mascoteria-export.test.mjs`. Cubrir navegación y foco, selección múltiple, eliminación y exportación con filtros activos.

## 4. Validación y entrega

- Por bloque, escribir la prueba de comportamiento, comprobar que falla por la ausencia de la funcionalidad, implementar y repetir la comprobación. Usar los mecanismos de Node, Miniflare y Playwright ya establecidos en el repositorio. Registrar los comandos reales y sus resultados en `tasks.md`.
- Ejecutar la migración e importación en D1 local y cotejar el informe con el Excel. Revisar los criterios CA-01 a CA-07. Comprobar claro y oscuro, móvil y escritorio, teclado y flujos de edición y exportación del registro existente.
- Generar e inspeccionar el paquete con `scripts/build-cloudflare.mjs`. Verificar la inclusión de los recursos necesarios y la exclusión del libro y la documentación interna. Trabajar en la rama de la especificación y separar la validación local de una futura publicación autorizada.


## Decisiones de implementación

- La consulta agrupa las filas de D1 por mascota, filtra y pagina en el servidor. Se usa un orden alfabético en español con desempate por identificador. El tamaño inicial es de 50 filas en escritorio y 20 en móvil.
- La API admite hasta 250 puntos de código por campo de texto. El alta usa un identificador generado por el cliente y conserva la petición normalizada para confirmar reintentos del mismo alta.
- D1 verifica versiones y propietarios dentro del lote. El marcador de importación se escribe en la misma transacción que las 55 mascotas y sus vínculos.
- Un fallo de guardado conserva las propuestas durante la sesión de edición. Un conflicto de versión exige revisar el borrador y volver a cargar el estado guardado. La edición de Mascotería carece de reconciliación automática con versiones más recientes.
