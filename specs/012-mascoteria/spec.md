# 012 — Mascotería

**Estado (9 de noviembre de 2026).** Borrador de especificación con clarificaciones abiertas. Alcance autorizado: definir la funcionalidad, inspeccionar las fuentes en lectura y ubicar el Excel original. Planificación, implementación, importación y publicación pendientes de su etapa.

## Objetivo

Añadir una página «Mascotería» a Nido del Cuervo. Desde el mismo menú se podrá acceder al «Registro de personajes» y a «Mascotería». La nueva página permitirá consultar y editar un listado único de entradas procedentes del Excel con los patrones de interacción del registro.

## Requisitos

- **RF-01. Navegación.** Las dos páginas comparten un menú breve con enlaces a «Registro de personajes» y «Mascotería» e identificación de la página activa. El registro conserva su acceso desde la raíz. El menú se puede usar con teclado y en móvil.
- **RF-02. Listado.** Mostrar una única tabla adaptable con Nombre, Propietario, Animal, Imagen y Ubicación. Mantener la identidad, los temas y los patrones de consulta del registro. Se propone buscar por nombre y combinar los filtros desplegables de propietario, animal y ubicación. Una ubicación vacía se puede filtrar con «Sin ubicación» sin convertirla en una ubicación guardada.
- **RF-03. Edición.** Replicar el modo de edición y guardado del registro, con controles adaptados a la nueva tabla. El selector de propietario ofrece personajes existentes del registro y muestra sus nombres. Se propone un desplegable de ubicación que permita dejarla vacía. Los campos editables restantes y el alcance de otras acciones se cierran en clarificación.
- **RF-04. Vínculo de propietario.** Vincular a los personajes por su identificador estable para que un cambio de nombre se refleje en Mascotería. Contrastar cada nombre del Excel con los personajes activos. Las coincidencias únicas literales tras normalizar Unicode, espacios y capitalización se pueden resolver automáticamente. Las abreviaturas, variantes, faltantes y ambigüedades requieren revisión. La regla solicitada es que el propietario sea un personaje; las excepciones presentes en el Excel quedan pendientes de decisión.
- **RF-05. Ubicación inicial.** Los dos grupos de columnas bajo «Mascotería» comparten esa ubicación. El resto del bloque superior usa «Fuera del gremio» o «Establos» según su encabezado. Las entradas del bloque inferior quedan con ubicación vacía.
- **RF-06. Importación inicial.** Conservar los valores de origen y sus ausencias. Identificar cada entrada por grupo de columnas y fila, de forma que nombres repetidos o filas parciales puedan reconciliarse individualmente. Revisar las incidencias antes de incorporar filas con dueño sin resolver. Excluir encabezados, separadores y notas fuera de las columnas de datos. Mantener separadas la importación inicial y la edición posterior. D1 es la fuente activa prevista, de acuerdo con el registro actual.
- **RF-07. Imágenes.** Mostrar la imagen asociada a cada entrada cuando exista y se haya podido validar su correspondencia. Admitir filas sin imagen. Conservar las imágenes de origen durante la revisión y comprobar las que están dentro de celdas y las que están superpuestas. Las celdas que un lector genérico devuelve como `#VALUE!` pueden referenciar imágenes embebidas.
- **RF-08. Fuente privada.** Conservar el libro original intacto y fuera de Git y del paquete público. Solo los datos e imágenes de las entradas confirmadas forman parte de la entrega futura. La navegación y consulta de personajes conservan su comportamiento actual.

## Inventario comprobado

- `Hoja1` contiene 58 entradas candidatas con algún dato. En las filas 3–14 hay 24 en Mascotería, 8 en Fuera del gremio y 4 en Establos. Las filas 18–34 contienen 22 sin ubicación. La fila 17 repite los encabezados. Establos solo proporciona nombre y propietario.
- Se han observado 40 celdas con referencias a imágenes, 39 archivos de imagen dentro del libro y 2 anclajes gráficos superpuestos. Las celdas `N7` y `D26` comparten la misma referencia. Los objetos superpuestos se anclan a `N7` y al área `C26:D27`. Queda por validar qué imágenes corresponden a esas entradas.
- Contrastadas 58 entradas con los 206 personajes activos devueltos por la API pública el 9 de noviembre. 31 entradas tienen un propietario único con coincidencia literal normalizada. Las demás requieren confirmar equivalencias o decidir cómo representar los casos especiales. Este recuento es de inspección, no de importación.
- Original disponible localmente en `.local/imports/012-mascoteria/La-Mascoteria.xlsx`, con SHA-256 idéntico antes y después del traslado.

## Clarificaciones pendientes

1. Confirmar equivalencias de nombres y cómo representar las cinco entradas a nombre del Nido (`Q3:Q6` y `L18`), una con tres copropietarios (`L10`) y una sin propietario (`B24`). Revisar también las filas parciales y las referencias de imagen de `N7` y `D26`.
2. Confirmar si la edición pública actual del registro se extiende a Mascotería. Acordar qué campos se pueden cambiar, cómo se gestionan las imágenes y si entran en esta entrega las altas, las bajas o la exportación.
3. Definir qué se muestra y qué se puede guardar si un personaje ya vinculado se elimina del registro. Conservar la trazabilidad del vínculo y evitar reasignaciones automáticas.

## Criterios de aceptación

1. **CA-01 / RF-01.** Las dos páginas enlazan entre sí, indican dónde está el visitante y se pueden recorrer con teclado y en móvil.
2. **CA-02 / RF-02–RF-03.** Se puede consultar y editar la tabla con el conjunto de controles acordado. Los filtros aprobados se combinan y muestran correctamente las entradas con ubicación vacía. Un guardado correcto persiste al recargar y un error conserva los cambios pendientes.
3. **CA-03 / RF-03–RF-04.** Los dueños resueltos se guardan como referencias a personajes existentes. Renombrar un personaje actualiza su nombre visible en Mascotería. El tratamiento de titularidades excepcionales y personajes eliminados coincide con las decisiones de clarificación.
4. **CA-04 / RF-05–RF-07.** El resultado se reconcilia fila a fila con las 58 entradas candidatas. Toda exclusión o corrección tiene motivo registrado. Se comprueban ubicaciones, valores ausentes y asociación de imágenes, incluidas las imágenes superpuestas.
5. **CA-05 / RF-08.** El Excel no figura en Git ni en el paquete público. Las comprobaciones del registro y sus flujos vigentes pasan. Se valida en local y sin escrituras de prueba en producción.
