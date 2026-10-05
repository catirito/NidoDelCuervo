# Nido del Cuervo — exportación de personajes a Excel

Estado: alcance clarificado, implementación y validación local completadas. Rama local: `codex/007-exportacion-excel`. Creación de la rama en GitHub bloqueada por revisión automática del push. Planificación autorizada; plan elaborado en plan.md. Tareas autorizadas y desglosadas en tasks.md; implementación autorizada y completada; evidencia y límites en tasks.md.

## Objetivo confirmado
Permitir exportar la lista de personajes desde la web a un archivo Excel descargable.

## Decisiones confirmadas
- Exportar todos los personajes, independientemente de los filtros y la búsqueda activos. Aplicar el criterio de ordenación activo de la tabla al conjunto completo, sin aplicar filtros ni búsqueda.
- Incluir los nueve campos de la tabla, en su orden: personaje, clase, subclase, especie, nivel, rango, estado, propietario y notas (PERSONAJE, CLASS, SUBCLASS, SPECIE, NIVEL, RANGO, ESTADO, PROPIETARIO, NOTAS).
- Exportar únicamente datos guardados; deshabilitar «Exportar Excel» mientras esté activo el modo edición. No incluir borradores ni guardar cambios como efecto de exportar.
- Generar el archivo Excel en el navegador y descargarlo únicamente al dispositivo del cliente mediante el mecanismo de descargas del navegador.
- No guardar ni generar el archivo exportado en el servidor, D1 u otro almacenamiento remoto.
- Incorporar un botón «Exportar Excel». El usuario delega su ubicación: se sitúa en la barra de acciones sobre la tabla, junto a «Editar», por ser una acción sobre la lista. Conservar acceso por teclado y adaptación a móvil.
- La ubicación final del archivo en el dispositivo depende de la configuración de descargas del navegador.

## Contexto y límites
- D1 es la fuente activa de personajes; el Excel original es un histórico de solo lectura y no se modifica ni se ofrece como descarga.
- La exportación crea un archivo nuevo, sin escribir en D1.
- Mantener HTML, CSS y JavaScript separados, sin frameworks ni dependencias nuevas sin acuerdo.
- No incluir catálogos auxiliares, identificadores internos o versiones sin solicitud expresa.

## Detalles concretados en el plan autorizado
Archivo `.xlsx`, hoja «Personajes» y encabezados visibles de la tabla. Nivel numérico, rango como valor y textos/vacíos intactos. Nombre `nido-del-cuervo-personajes-AAAA-MM-DD.xlsx` con fecha local del cliente. Deshabilitar para conjunto completo vacío; no hacerlo cuando solo la búsqueda o los filtros dejan la vista vacía. Se exporta la última consulta o guardado cargado en el navegador, sin consulta adicional.

## Criterios de aceptación preliminares
- El botón «Exportar Excel» genera en el navegador y descarga al dispositivo del cliente un archivo nuevo con los personajes, columnas y orden acordados, sin almacenar el archivo en el servidor.
- Incluir todos los personajes y los nueve campos, aplicando el criterio de ordenación activo aunque haya filtros o búsqueda.
- Deshabilitar el botón durante edición y excluir borradores.
- Mantener los valores de la fuente elegida sin inventar datos ni interpretar textos como fórmulas.
- No modificar D1 ni el Excel histórico.
- Mostrar el resultado o un error comprensible; evitar descargas incompletas cuando falle la obtención de datos.
- Poder iniciar la descarga con teclado y desde móvil.

## Fuera de alcance
Importación, sincronización bidireccional, modificación del Excel histórico y edición de catálogos mediante Excel.

## Próxima etapa
Revisión del usuario; commit, push y publicación pendientes de autorización.
