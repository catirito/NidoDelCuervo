# 012 — Mascotería

**Estado (9 de noviembre de 2026).** Implementación e importación validadas en local. Pendiente de revisión del usuario. Evidencia en [tareas](tasks.md).

## Objetivo

Añadir una página «Mascotería» a Nido del Cuervo. Desde el mismo menú se podrá acceder al «Registro de personajes» y a «Mascotería». La nueva página permitirá consultar y editar un listado único de entradas procedentes del Excel con los patrones de interacción del registro.

## Requisitos

- **RF-01. Navegación.** Las dos páginas comparten un menú breve con enlaces a «Registro de personajes» y «Mascotería» e identificación de la página activa. El registro conserva su acceso desde la raíz. El menú se puede usar con teclado y en móvil.
- **RF-02. Listado.** Mostrar una única tabla adaptable con Nombre, Propietario, Animal y Ubicación. Mantener la identidad, los temas y los patrones de consulta del registro. La búsqueda por nombre y los filtros desplegables de propietario, animal y ubicación se combinan. Filtrar por un propietario incluye las mascotas que lo tienen entre sus propietarios. «Sin propietario» y «Sin ubicación» filtran campos vacíos. El listado prioriza la ubicación «Mascotería». Dentro de ese grupo y del resto, ordena por Animal de la A a la Z, con los valores vacíos al final y desempate por Nombre.
- **RF-03. Edición pública.** Replicar el acceso público y el modo de edición y guardado del registro. En el alta y la edición, un selector múltiple permite elegir cero, uno o varios personajes activos por mascota. Se puede quitar cualquier propietario, incluido el último. La tabla muestra juntos sus nombres oficiales y deja la celda vacía cuando no hay propietarios. En las altas, el nombre es el único campo obligatorio. En alta y edición, Animal y Ubicación son desplegables que permiten elegir un valor existente, dejarlo vacío o añadir otro. Propietarios usa un select de personajes del Registro. Cada elección se añade a la lista y el select se restablece para elegir otro. Su etiqueta usa el mismo estilo que las de Animal y Ubicación.
- **RF-04. Vínculo de propietario.** Durante la importación, resolver cada propietario individual del Excel mediante coincidencia única normalizada o las equivalencias confirmadas. Guardar cada vínculo por identificador estable, una sola vez por mascota. Consultar el nombre oficial directamente del Registro de personajes para mostrarlo en la tabla y los desplegables de Mascotería. Un cambio de nombre en el registro se refleja en ambas páginas. La baja lógica de un personaje conserva su vínculo y su nombre visible en Mascotería, incluso al editar otros campos. El selector ofrece personajes activos para nuevas asignaciones. La mascota se puede dar de baja manualmente.
- **RF-05. Ubicación inicial.** Los dos grupos de columnas bajo «Mascotería» comparten esa ubicación. El resto del bloque superior usa «Fuera del gremio» o «Establos» según su encabezado. Las entradas del bloque inferior quedan con ubicación vacía.
- **RF-06. Importación inicial.** Conservar los valores de origen y sus ausencias según las reglas confirmadas de ubicación y propietario. Identificar cada entrada por grupo de columnas y fila, de forma que nombres repetidos o filas parciales puedan reconciliarse individualmente. Importar únicamente las entradas con nombre y conservar los demás campos vacíos cuando falten. Excluir encabezados, separadores y notas fuera de las columnas de datos. Mantener separadas la importación inicial y la edición posterior. D1 es la fuente activa, de acuerdo con el registro actual.
- **RF-07. Alcance de imágenes.** Las imágenes se aplazan. Esta versión utiliza únicamente Nombre, Propietario, Animal y Ubicación en la importación, el almacenamiento, la web y la exportación. Las escrituras públicas rechazan archivos y campos de imagen.
- **RF-08. Fuente privada.** Conservar el libro original intacto y fuera de Git y del paquete público. La entrega contiene los datos confirmados de las entradas incluidas. La navegación y consulta de personajes conservan su comportamiento actual.
- **RF-09. Altas y bajas.** Permitir añadir mascotas y tramitar su baja lógica con los mismos patrones del registro. Confirmar la baja al guardar y excluir las mascotas dadas de baja de las consultas y la exportación.
- **RF-10. Exportación.** Descargar un Excel con todas las mascotas activas guardadas, incluidas las de otras páginas y las que quedan fuera de la búsqueda o los filtros. Exportar los nombres oficiales de todos los propietarios de cada mascota y dejar vacío el campo cuando no tenga. El Excel contiene únicamente los cuatro campos de datos.

## Inventario comprobado

- `Hoja1` contiene 58 entradas candidatas con algún dato. En las filas 3–14 hay 24 en Mascotería, 8 en Fuera del gremio y 4 en Establos. Las filas 18–34 contienen 22 sin ubicación. La fila 17 repite los encabezados. Establos solo proporciona nombre y propietario.
- Contrastadas 58 entradas con los 206 personajes activos devueltos por la API pública el 9 de noviembre. 31 entradas tienen un propietario único con coincidencia literal normalizada. Otras 20 se resuelven mediante las equivalencias confirmadas. Las 7 restantes corresponden a titularidades especiales. Recuento previo a la importación.
- Original disponible localmente en `.local/imports/012-mascoteria/La-Mascoteria.xlsx`, con SHA-256 idéntico antes y después del traslado.

## Clarificaciones confirmadas

El usuario confirma las siguientes equivalencias para la importación. Mascotería muestra la grafía oficial del Registro de personajes.

| Nombre en el Excel | Nombre oficial en el registro |
| --- | --- |
| Alonso | Alonso Fernandez |
| Azura | Azura Vylara |
| Cándido | Cándido Fairyring |
| Chispas | Francis "Chispas" |
| Eldra | Eldra González |
| Fayl´en | Fayl'en Estela Brillante |
| Fungencio | Fungencio Pensativus |
| Gr-00-T y Groot | Stroheim Gr00t |
| Hopper | Harrison Hopper |
| Kyu | Kyū Taigen |
| Plumas | Plumas/Nevi |
| Regor (pastor) | Regor |
| Sam | Samael |
| Thaldis | Thaldris Zirthalon |

- Las cinco entradas cuyo propietario en el Excel es `Nido` (`Q3:Q6` y `L18`) se importarán sin propietario. La entrada con propietario vacío (`B24`) también quedará sin propietario.
- Tinka del clan Pirrika (`L10`) se importará como una sola mascota con tres vínculos de propietario a **Kekai**, **Francis "Chispas"** y **Gorluk**.
- Mascotería tendrá edición pública, altas, bajas, exportación y filtros, siguiendo los flujos del Registro de personajes.

- Se importarán 55 entradas. Se excluyen las tres sin nombre (`K8`, `A25` y `A26`) y la nota de los cebos situada fuera de la tabla (`S18`).

## Criterios de aceptación

1. **CA-01 / RF-01.** Las dos páginas enlazan entre sí, indican dónde está el visitante y se pueden recorrer con teclado y en móvil.
2. **CA-02 / RF-02–RF-03.** Se puede consultar y editar la tabla con el conjunto de controles acordado. Los filtros se combinan y distinguen entradas sin propietario o sin ubicación. Tinka aparece al filtrar por cualquiera de sus tres propietarios. Un guardado correcto persiste al recargar y un error conserva los cambios pendientes.
3. **CA-03 / RF-03–RF-04.** El alta y la edición permiten guardar cero, uno o varios propietarios distintos. Tinka tiene tres vínculos. Las cinco entradas del Nido y la que carece de propietario quedan con el campo vacío. Renombrar un personaje actualiza su nombre visible en Mascotería. La baja lógica de un propietario conserva su nombre visible y la mascota sigue activa. Es posible darla de baja manualmente.
4. **CA-04 / RF-05–RF-07.** Se importan 55 de las 58 entradas candidatas. Se excluyen las tres sin nombre y la nota de los cebos. Toda exclusión o corrección tiene motivo registrado. Se comprueban ubicaciones y valores ausentes.
5. **CA-05 / RF-08.** El Excel no figura en Git ni en el paquete público. Las comprobaciones del registro y sus flujos vigentes pasan. Se valida en local y sin escrituras de prueba en producción.
6. **CA-06 / RF-09–RF-10.** Las altas guardadas aparecen en el listado. Las bajas confirmadas quedan excluidas del listado y del Excel. La exportación incluye todas las mascotas activas con todos sus propietarios oficiales, aunque haya filtros aplicados. El Excel carece de imágenes incrustadas y de enlaces a las imágenes internas.
7. **CA-07 / RF-03 y RF-07.** El alta pública funciona con solo el nombre y rechaza un nombre vacío. La tabla y el Excel contienen los cuatro campos de datos. Las peticiones directas a la API con archivos, URLs de imagen o referencias de imagen son rechazadas y no producen escrituras.
