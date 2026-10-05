# 009 — Añadir personajes

Estado: especificación y planificación autorizadas; documentos preparados para revisión. Desglose de tareas autorizado y preparado en tasks.md; implementación y validación de la funcionalidad no autorizadas. Sin commit, push, merge, PR ni publicación. Rama local: `codex/009-anadir-personajes`, creada desde main local `85b82ec` antes de escribir documentos; creación remota aplazada por la instrucción expresa de no hacer push.

## Objetivo
Permitir que cualquier visitante añada un personaje al registro compartido, desde un formulario en una modal. El alta se guarda en D1 y puede consultarse desde otras sesiones; no depende del almacenamiento del navegador ni del Excel histórico.

## Requisitos confirmados por el usuario
- Botón «Añadir personaje» junto al botón «Editar» actual.
- Abrir una modal pequeña con un formulario que reutilice los mismos controles, selectores y opciones de la edición existente, incluyendo su opción de introducir valores nuevos.
- Obligatorios: personaje (`PERSONAJE`), clase (`CLASS`), especie (`SPECIE`) y propietario (`PROPIETARIO`).
- Nivel (`NIVEL`) inicialmente 1 y modificable con los mismos controles de edición.
- Los demás campos son opcionales. Subclase (`SUBCLASS`), estado (`ESTADO`) y notas (`NOTAS`) pueden quedar vacíos. Rango (`RANGO`) mantiene la regla existente de cálculo desde nivel; no se convierte en un campo manual.
- Cualquier visitante puede añadir, sin cuentas ni autenticación.
- Tras guardar, el nuevo personaje queda persistido y disponible para todos en la web.

## Reglas existentes que se conservan
- Nivel entero de 1 a 20; rango derivado mediante rank.js.
- Nombre y valores de opciones hasta 50 puntos de código Unicode; notas hasta 2.000. Obligatorios no aceptan vacíos ni solo espacios. La obligatoriedad adicional de clase/especie/propietario se aplica al alta, sin endurecer la edición de registros existentes.
- Nombre conserva su texto; opciones eliminan espacios exteriores y reutilizan grafía existente cuando solo cambia capitalización. No fusionar registros ni eliminar diferencias de acentos/espacios interiores.
- Subclase depende de clase: seleccionar otra clase vacía una subclase incompatible y permite elegir otra antes de guardar. La subclase nueva se asocia a la clase elegida.
- Clases, subclases y especies usan los catálogos completos de D1, incluso opciones sin uso. Estado y propietario usan valores globales guardados en personajes. No depender de las filas de la página visible.
- Se permiten nombres de personaje repetidos; su identidad es UUID.
- El Excel es un histórico intacto de solo lectura y no se modifica, reimporta ni publica.

## Comportamiento propuesto en el plan
- Alta independiente del lote de edición: no guardar, descartar ni renovar silenciosamente las versiones de sus borradores.
- Abrir y escribir no persiste nada. «Guardar personaje» crea personaje y opciones nuevas utilizadas en una operación atómica. «Cancelar» o Escape antes del envío descartan solo el formulario de alta.
- Validación visible y accesible antes del envío y nuevamente en servidor. Errores conservan el formulario; bloquear doble envío y resolver respuestas perdidas sin duplicar la operación.
- Tras éxito, cerrar modal y anunciar el nombre guardado. Recargar la consulta actual conservando filtros, búsqueda, orden, página y tamaño; si el alta queda fuera de esa vista, mantener la confirmación sin forzar que aparezca en la página actual.
- Otros visitantes ven el alta en su siguiente consulta/recarga. No añadir sincronización en tiempo real.
- Modal etiquetada, foco inicial en nombre, contención de foco mientras está abierta, retorno al botón y disposición compacta con desplazamiento interno si hace falta en móvil. Mantener temas y foco existentes.

Las decisiones de interacción y contrato detalladas en plan.md son propuestas técnicas para revisión, no resultados de una implementación ya probada.

## Criterios de aceptación
1. Cualquier visitante abre el formulario desde el botón junto a Editar; nivel empieza en 1 y se modifica dentro de 1–20.
2. No se crea un registro sin los cuatro campos obligatorios válidos, tampoco mediante petición directa a API.
3. Se reutilizan los controles y opciones de edición, incluyendo nuevos valores y dependencia de subclase; opcionales vacíos se guardan como null.
4. Un alta mínima produce UUID propio, versión inicial, rango correcto y clave de búsqueda, y aparece al consultar desde otra sesión.
5. El registro se puede buscar, editar, paginar y exportar con las funciones existentes, incluso cuando el total supera los 203 registros iniciales.
6. Alta y opciones nuevas usadas se guardan juntas o no se guarda ninguna; un error no deja altas parciales.
7. Doble clic, reintento de la misma operación tras respuesta perdida y solicitudes concurrentes no duplican personajes ni colisionan en el desempate de orden interno.
8. Cancelar antes del envío no escribe. Borradores de edición, datos previos, Excel, filtros, exportación y distribución de la cabecera de 008 se conservan.
9. Teclado, cierre, errores y foco funcionan en escritorio/móvil y ambos temas.

## Fuera de alcance
Eliminar personajes, moderación, cuentas, importación/sincronización con Excel, actualización en tiempo real, nuevos proveedores, dependencias, rediseño general y publicación.

## Base y duplicación comprobadas
Base actual: main local `85b82ec`, que contiene exportación, paginación y cabecera 008. Existe un borrador anterior `specs/008-anadir-personajes/` en otro worktree (`d0b5`) basado en paginación `a495be8`; no se integra ni sustituye a 008-cabecera-listado. Esta carpeta 009 es la especificación canónica del alta en el checkout actual. El otro borrador permanece fuera de este alcance, señalado como obsoleto para evitar implementaciones paralelas.

## Próxima etapa
Revisión de tasks.md y autorización de implementación antes de ejecutar las tareas.
