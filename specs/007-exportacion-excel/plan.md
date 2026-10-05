# Plan — exportación de personajes a Excel

Estado: planificación autorizada y elaborada para revisión. Rama local `codex/007-exportacion-excel`. Desglose de tareas autorizado y elaborado en tasks.md; implementación autorizada y completada; validación y límites en tasks.md. Push de la rama pendiente por rechazo previo de revisión automática.

## 1. Datos y orden
Usar el conjunto completo de personajes guardados cargado en el navegador desde GET /api/characters, actualizado por el guardado existente. La exportación representa esa última consulta o guardado; no garantiza incluir cambios de otros clientes posteriores a la carga. No añadir solicitudes, endpoints, escrituras ni almacenamiento remoto para exportar.

Al pulsar, comprobar que hay datos disponibles y que no se está editando ni guardando. Reutilizar visibleCharacters() únicamente fuera de edición, cuando contiene los datos guardados, y sortCharacters() con el campo y dirección activos en app.js. No usar las filas del DOM ni el resultado filtrado. Mantener el desempate por sourceRow y vacíos al final que ya usa la tabla.

## 2. Archivo y generación local
Reutilizar vendor/xlsx.full.min.js, SheetJS CE 0.20.3 con su licencia existente; no incorporar dependencias ni CDN. Añadir export-excel.js para transformar los personajes en una hoja y generar/descargar el libro. app.js coordina disponibilidad, datos y orden; el módulo de exportación recibe datos y no consulta la API.

Crear un .xlsx con una única hoja «Personajes». Reutilizar fields de records.js para el orden y declarar encabezados visibles: Personaje, Clase, Subclase, Especie, Nivel, Rango, Estado, Propietario, Notas. Excluir id, version, sourceRow y catálogos. NIVEL será numérico; los demás campos serán texto o celdas vacías. RANGO será su valor guardado, sin fórmulas. Conservar acentos, saltos de línea y contenido sin rellenar vacíos ni convertirlos en «Sin dato».

Construir celdas de texto explícitas, sin propiedad de fórmula, incluidos textos que comiencen con =, +, - o @. No alterar esos textos con prefijos añadidos. Verificar el archivo generado leyéndolo de nuevo con la biblioteca existente.

Presentación sencilla: encabezado en primera fila y anchuras de columna razonables, acotadas para notas largas. Sin macros, hojas ocultas ni reproducción del formato del Excel histórico. Nombre nido-del-cuervo-personajes-AAAA-MM-DD.xlsx con fecha local del navegador del cliente.

Generar los bytes en memoria y solicitar la descarga mediante las capacidades de navegador de SheetJS. El archivo nunca se envía al servidor. El navegador decide carpeta y posibles diálogos de descarga; la web solo puede informar que solicitó la descarga, no confirmar que el usuario guardó el archivo en disco.

## 3. Botón y estados
Añadir «Exportar Excel» en index.html dentro de la barra de acciones, junto a «Editar». Ajustar styles.css solo si hace falta para conservar la adaptación de esa barra, sin rediseñar la página. Botón nativo, nombre visible, foco de teclado y estilos consistentes con las acciones actuales.

Deshabilitar durante carga, error de carga, lista completa vacía, edición, guardado o generación. Una búsqueda sin resultados no deshabilita el botón cuando existen personajes en el conjunto completo. Tras guardar o salir de edición, recalcular disponibilidad usando el estado real.

Capturar fallos de generación/descarga, mostrar un mensaje accesible y permitir reintentar. Usar una región de estado propia para la exportación, conservando el contador y los mensajes de edición. No mostrar errores de exportación como errores de carga del registro.

## 4. Integración pública
Cargar la biblioteca local antes de la lógica que la necesita, mediante un script externo en index.html; mantener la lógica propia en módulos separados. Añadir export-excel.js, vendor/xlsx.full.min.js y vendor/LICENSE a la lista explícita de scripts/build-cloudflare.mjs. Conservar avisos de licencia y procedencia en vendor/README.md.

No incluir Registro de personajes.xlsx ni documentación interna en la salida pública. No cambiar API, esquema D1, catálogos, importación ni configuración de infraestructura. Publicación y ejecución de pruebas en producción quedan fuera de esta etapa.

## 5. Verificación proporcional en la implementación
- Prueba de ida y vuelta del XLSX: nueve encabezados, todas las filas, niveles numéricos, valores vacíos, acentos, notas con saltos de línea, rango sin fórmula y textos que parecen fórmulas conservados como texto; ausencia de campos internos y hojas auxiliares.
- Comprobar orden activo y desempates con datos controlados, sin modificar el Excel histórico.
- Prueba local en navegador: descarga real capturada y archivo inspeccionado, filtros/búsqueda activos sin reducir filas, disponibilidad durante carga y edición, guardado actualizado, error de generación y reintento. Verificar que pulsar exportar no produce solicitudes de escritura ni envía el archivo.
- Revisar teclado y barra de acciones en escritorio y móvil. No afirmar guardado físico ni compatibilidad con todos los navegadores por capturar una descarga de prueba.
- Usar los mecanismos de prueba existentes en tests/ y el servidor local establecido. Concretar comandos en tasks.md tras autorización, sin instalar herramientas nuevas.
- Comprobar el contenido de la salida del build y que el Excel histórico conserve su hash. No es necesario ampliar pruebas de D1 si no se modifica su código.

## Próxima etapa
Revisión del usuario; commit, integración con paginación en main y publicación autorizados.

## Integración con paginación autorizada — 5 de octubre de 2026
La tabla ahora consulta páginas al servidor. Para conservar la exportación de todos los personajes, obtenerlos con GET /api/characters?pageSize=all&sort=...&direction=..., sin filtros ni búsqueda. Generar el XLSX solo en el navegador y no almacenar el archivo en el servidor. Esta decisión de integración sustituye el uso de un snapshot completo cargado previamente y la ausencia de solicitudes adicionales descritos en el plan inicial. Bloquear edición durante la preparación para evitar exportar borradores. No modificar API ni D1 para exportar.

## Entrega publicada
Merge en main 5f5649e y push confirmados. Cloudflare Pages confirmó 6598ab42.nido-del-cuervo.pages.dev; URL estable https://nido-del-cuervo.pages.dev. Comprobación visual de solo lectura en navegador: botón Exportar Excel, 50 de 203 personajes y paginador Página 1 de 5. Sin escrituras de prueba, importación ni nuevas migraciones en producción. Las pruebas funcionales de descarga y paginación se ejecutaron en local. Excluidos histórico y documentos internos del paquete público.
