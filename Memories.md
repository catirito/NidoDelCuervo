# Memoria del proyecto

## Propósito
Síntesis del estado vigente y de las decisiones necesarias para continuar. Las reglas estables están en `AGENTS.md`; el detalle funcional y las evidencias están en `specs/`. Git conserva las versiones anteriores. Esta memoria es una convención del proyecto, no un mecanismo automático.

## Estado y alcance actuales
- Las funcionalidades hasta 010, incluidos alta, eliminación lógica y edición adaptable en dos líneas, están implementadas e integradas en `main`. La evidencia de la última publicación del producto quedó registrada en `14306d7`.
- Última publicación documentada: 5 de octubre de 2026, código `9a66185`, despliegue `33c3ec76.nido-del-cuervo.pages.dev`, URL estable https://nido-del-cuervo.pages.dev. La comprobación de producción registrada está en `specs/010-eliminar-personajes/tasks.md`; no equivale a una nueva comprobación remota en cada lectura de esta memoria.
- El bug documental de memoria vigente está corregido, integrado en `main` y subido a GitHub mediante merge `eec6c4c`. Sus informes están en `.specify/bugs/memoria-estado-vigente/`: `assessment.md`, `fix.md` y `test.md`; flujo aplicado manualmente, sin instalar Spec Kit. Trabajo actual: regla de proporcionalidad aprobada e incorporada a `AGENTS.md`, con actualización de esta memoria; mejora separada del bug, revisada y autorizada para commit y push por el usuario. No hay nueva especificación funcional ni despliegue autorizados.

## Arquitectura y datos vigentes
- HTML, CSS y JavaScript separados; Pages Functions sirve la API y D1 es la fuente activa de consulta y edición. La web no lee el Excel histórico ni un snapshot `characters.json` como fuente activa.
- `Registro de personajes.xlsx` conserva los 203 registros de la importación inicial; no representa el total actual de D1 ni un límite funcional. Permanece privado y de solo lectura. No reimportar personajes ni catálogos al desplegar: se perderían cambios posteriores.
- Los personajes tienen UUID estable, versión de concurrencia y `sourceRow` para desempates. El nombre no es una clave única. El rango se calcula desde el nivel, no desde las fórmulas históricas del Excel.
- Clases, subclases y especies tienen catálogos propios en la misma D1; sus opciones permanecen disponibles aunque no estén en uso. Las subclases pertenecen a una clase. Estado y propietario se obtienen de valores guardados en personajes, sin catálogos independientes.
- La consulta y escritura son públicas, sin cuentas ni autenticación, por decisión expresa del usuario. «Editar» cambia el modo de interfaz; no constituye control de acceso. Las instrucciones para robots tampoco restringen acceso.

## Comportamiento que debe conservarse
- Consulta: nueve campos del registro; búsqueda parcial por nombre sin distinguir mayúsculas, conservando diferencias de acentos; filtros combinados con AND. Orden inicial por nivel descendente y desempate estable por `sourceRow`.
- Paginación en servidor sobre el conjunto filtrado y ordenado: 50 filas inicialmente en escritorio y 20 en móvil; tamaños 20/50/100/Todos. Los borradores se conservan entre páginas y las respuestas antiguas no deben sustituir consultas más recientes.
- Edición: nombre, nivel, notas, estado, propietario, clase, subclase y especie. Guardar persiste el lote completo de forma atómica con control de versiones; un conflicto no puede dejar cambios o catálogos parciales. La recuperación de respuestas perdidas conserva propuestas y evita confirmaciones falsas.
- Nivel entero entre 1 y 20; rango derivado en `rank.js`. Nombre obligatorio; máximo 50 puntos de código Unicode en nombre y opciones, 2.000 en notas. Las opciones eliminan espacios exteriores y reutilizan grafía existente si solo cambia capitalización. Cambiar de clase vacía una subclase incompatible.
- Alta: modal con los controles de edición; nombre, clase, especie y propietario obligatorios, nivel inicial 1 modificable y restantes campos opcionales. El alta es independiente de los borradores de edición; reintentar una operación incierta no duplica personajes.
- Eliminación lógica: «Eliminar» alterna una marca pendiente durante edición y conserva los demás cambios. Guardar persiste campos y marca juntos. Los datos permanecen en D1; lista y exportación excluyen eliminados. La reconciliación no los reactiva. Restauración, purga y listado de eliminados no están implementados.
- Exportación: obtiene todos los personajes activos guardados, sin filtros ni búsqueda y con el orden activo, incluidos los de otras páginas. Genera el XLSX en el navegador con nueve campos, sin guardar el archivo en el servidor. Se deshabilita durante edición y estados de carga, error o generación; una búsqueda sin resultados no impide exportar el registro completo.
- Presentación: identidad púrpura/plateada, logo PNG y fuentes locales Cinzel/Roboto Flex. El selector muestra luna en oscuro y sol en claro; preferencia manual persistida cuando el almacenamiento está disponible, con prioridad sobre el sistema. Sin elección manual sigue el sistema.
- Cabecera: título y acciones juntos; contador en línea independiente antes de la tabla. La edición usa dos líneas por personaje en escritorio y bloques adaptables en móvil; al salir vuelve la tabla de consulta. Los botones de alta, exportación y edición comparten hover y conservan foco visible.

## Mapa de especificaciones
Consultar solo las funcionalidades afectadas; cada carpeta contiene `spec.md`, `plan.md` y `tasks.md`.
- `specs/001-registro-personajes/`: campos e inspección del Excel inicial. Su arquitectura de lectura directa está sustituida por 004.
- `specs/002-diseno-visual/` y `specs/003-selector-tema/`: identidad visual y temas.
- `specs/004-edicion-niveles/`: transición a D1, rangos, edición atómica y concurrencia.
- `specs/005-edicion-datos-personajes/`: edición de nombre, notas, estado y propietario.
- `specs/006-edicion-catalogos/`: catálogos completos, dependencias y normalización.
- `specs/007-paginacion/` y `specs/007-exportacion-excel/`: dos carpetas con el mismo número conservadas sin renumeración retrospectiva; identificar siempre por nombre completo. La exportación integrada consulta el conjunto completo mediante API, sustituyendo el diseño inicial sin solicitudes adicionales.
- `specs/008-cabecera-listado/`: distribución del contador y acciones.
- `specs/009-anadir-personajes/`: especificación canónica de alta; el borrador `008-anadir-personajes` de otro worktree no debe usarse como alternativa.
- `specs/010-eliminar-personajes/`: eliminación lógica y ajuste posterior de edición en dos líneas.

## Entorno y publicación
- Repositorio: https://github.com/catirito/NidoDelCuervo. La rama de integración actual es `main`; comprobar el estado real de Git al retomar. Los problemas antiguos de credenciales no deben asumirse vigentes: publicaciones posteriores registran push normal correcto.
- Hosting activo: Cloudflare Pages, proyecto `nido-del-cuervo`, mediante Direct Upload; subir a GitHub no publica automáticamente. La rama de producción de Pages documentada es `codex/003-selector-tema`, aunque el código integrado procede de `main`. No confundir ambas referencias.
- `wrangler.jsonc` configura D1 local; `wrangler.production.jsonc` identifica D1 de producción `nido-personajes`. Las migraciones hasta 0006 constan aplicadas en la última entrega. Comprobar el estado remoto antes de cualquier migración futura autorizada.
- `scripts/build-cloudflare.mjs` prepara `.local/public` mediante una lista explícita de archivos; incluye SheetJS y licencia para exportar, excluye Excel histórico y documentación interna. No publicar la raíz. El despliegue de la API también requiere Functions y configuración de producción; el paquete estático por sí solo no describe el despliegue completo.
- El Site privado de Sites pertenece a una entrega anterior y no es el destino activo de publicación. Consultar Git si fuera necesario recuperar sus identificadores o procedimiento.

## Validación y límites conocidos
- Evidencias de API, navegador, recuperación, atomicidad y regresiones en los `tasks.md` correspondientes. Las pruebas con escrituras se ejecutan en local, restauran fixtures y deben ser secuenciales si comparten D1. No ejecutar escrituras de prueba en producción.
- La última entrega documenta revisión de edición a 1440/1280/1024/390/320 px en ambos temas, ausencia de errores JavaScript y rutas privadas con 404. No se ha acreditado compatibilidad con todos los navegadores ni una prueba con lector de pantalla real.
- `tests/records.test.mjs` comprueba el hash del Excel histórico. En la revisión documental del 6 de octubre también pasaron esa prueba y `tests/export-excel.test.mjs`; no se repitieron las pruebas de escritura de D1 ni la validación remota.
- El entorno de pruebas depende de Node, Chrome, Playwright/Miniflare y, según la prueba, un servidor D1 local. Los comandos y limitaciones registrados están en `specs/007-exportacion-excel/tasks.md` y las pruebas de cada funcionalidad. No asumir que un servidor local sigue activo.

## Pendientes identificados
- Revisar en una tarea documental posterior los estados antiguos que persisten en algunas especificaciones y planes: por ejemplo, 006 aún describe entrega solo local, 009 conserva implementación no autorizada y 010 conserva una próxima etapa anterior a su implementación. Esta limpieza se limita a la memoria; no se han corregido esos documentos ni deben interpretarse sus estados antiguos como estado vigente de la entrega integrada.
- La reproducibilidad del entorno de pruebas desde una copia limpia es una mejora propuesta en la auditoría, todavía no autorizada para implementación.
- No consta una estrategia adicional de copias programadas acordada. Antes de tomar decisiones de recuperación, verificar las capacidades actuales de D1 y las copias realmente disponibles; una copia puntual de personajes no equivale a un respaldo completo de base de datos.
