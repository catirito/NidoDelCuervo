# Memoria del proyecto

## Propósito
Recoger decisiones confirmadas y sus motivos para retomar el trabajo con contexto. Las reglas estables están en `AGENTS.md`; este archivo no las sustituye ni las duplica. `Memories.md` es una convención de este proyecto, no un mecanismo automático ni un estándar universal.

## Etapa actual
Validación completada. El usuario autorizó implementar la web y hacer commit y push a `main`. Las nueve tareas están verificadas. No hay autorización ni despliegue de hosting.

## Decisiones confirmadas
- El objetivo pedagógico es aprender desarrollo con IA paso a paso mediante una web simple; se avanza en etapas pequeñas para comprender cada decisión.
- Se ha elegido HTML, CSS y JavaScript sin frameworks y en archivos separados, para mantener clara la separación entre estructura, presentación y lógica.
- `Registro de personajes.xlsx` es la única fuente de datos y se utiliza solo en lectura, para conservar el registro original.
- El usuario prefiere código autoexplicativo sin comentarios; la intención se expresa con nombres y estructura, y los motivos se documentan fuera del código.
- Se adopta la secuencia del curso: constitución → especificación → clarificación → planificación → tareas → implementación → validación. `AGENTS.md` recoge reglas operativas y principios que contribuyen a la constitución; esta memoria conserva decisiones. La secuencia es la metodología elegida para el proyecto, no una exigencia universal de SDD.
- Se ha elegido la Frontend Skill de OpenAI como orientación para futuras tareas de diseño visual, con alcance exclusivo de este proyecto. Instalación local verificada el 1 de octubre de 2026 en `.agents/skills/frontend-skill/`, con `SKILL.md`, `agents/openai.yaml` y `LICENSE.txt`, sin dependencias obligatorias. Procede de `openai/skills`, ruta `skills/.curated/frontend-skill`, commit `30444aed500c00c85294d12074f6e3ee794f808a`, anterior a su retirada del catálogo el 23 de abril de 2026. Fuente: https://github.com/openai/skills/tree/30444aed500c00c85294d12074f6e3ee794f808a/skills/.curated/frontend-skill. Se conserva la versión oficial sin modificar; su orientación se adapta a las restricciones de `AGENTS.md`. Su aparición en el catálogo de esta sesión está verificada; la presentación de registro está implementada y verificada visualmente.

- La web mostrará una tabla de personajes de D&D con una presentación bonita y estructurada, permitirá ordenar y filtrar, y tendrá un logo de cuervo o de Nido del Cuervo sobre el menú. Los campos solicitados y las dudas están recogidos en `SPEC.md`.
- Tras conocer los encabezados, el usuario confirmó mostrar los nueve campos de la hoja principal: `PERSONAJE`, `CLASS`, `SUBCLASS`, `SPECIE`, `NIVEL`, `RANGO`, `ESTADO`, `PROPIETARIO` y `NOTAS`. Esta decisión no incluye mostrar los catálogos auxiliares como tablas ni rellenar datos vacíos.
- Se ha autorizado elaborar el plan manteniendo las decisiones no resueltas como pendientes. Los detalles menores se resolvieron durante la implementación autorizada; el comportamiento actual está en `SPEC.md` y `README.md`.
- El usuario solicita controles básicos de filtrado y ordenación por clase, subclase, especie, rango y propietario, sin filtros avanzados. No ha solicitado filtros adicionales de nivel o estado.
- El usuario confirma lógica AND entre todos los filtros activos, incluida la búsqueda parcial por `PERSONAJE`: cada fila debe cumplir todos los criterios.
- El filtro de nombre debe actualizarse inmediatamente desde la primera letra y mostrar nombres que contengan el texto en cualquier posición, sin botón obligatorio y sin buscar en otros campos. Filtrar y ordenar solo cambia la vista, no el Excel.
- El orden inicial será por `NIVEL` numérico descendente, con los niveles más altos primero, siguiendo la intención de orden del Excel.
- La búsqueda parcial inmediata por `PERSONAJE` no distingue mayúsculas/minúsculas, confirmado por el usuario; se mantiene la combinación AND.
- Está confirmado servir web y Excel juntos como página estática; no se ha elegido proveedor ni autorizado despliegue.
- La carpeta está vinculada mediante Git local con rama inicial `main` y `origin` en `https://github.com/catirito/NidoDelCuervo.git`. El commit inicial remoto con `README.md` se integró por avance rápido preservando los archivos locales. El usuario autorizó commit y push de la solución; fetch por transporte Git ya está verificado.
- En empates de `NIVEL` se conservará el orden original de las filas del Excel, confirmado por el usuario.
- La lectura será directa del XLSX mediante SheetJS Community Edition, en una copia local con versión fija y licencia, sin framework. La biblioteca está incorporada como versión 0.20.3, obtenida del repositorio oficial con licencia; procedencia y hashes en `vendor/README.md`.
- El Excel se cargará automáticamente al abrir la web desde una ruta relativa servida junto a ella, sin selector manual. Se necesitará servir web y Excel por HTTP local o hosting estático para `fetch`, sin depender de `file://`. El comando HTTP local probado está en `README.md`; no se ha desplegado hosting.
- La Frontend Skill ya aparece en el catálogo de esta sesión, verificado el 1 de octubre de 2026. La presentación de la web está implementada y revisada en escritorio y móvil.
- El usuario autorizó crear un logo temporal original: `assets/logo-cuervo.svg`, monocromo oscuro sobre fondo transparente, fácil de reemplazar. Asset creado y sintaxis/verificación visual comprobadas a 256 y 32 píxeles. El logo está integrado y la tarea de presentación está completada con revisión de la web.

## Hallazgos verificados
- El Excel contiene 203 registros en `Nido del Cuervo` y dos catálogos ocultos: `Species` (179 filas) y `Classes` (149 filas). Los encabezados y la correspondencia con los campos solicitados están documentados en `SPEC.md`.
- “Detalles personales” no es un encabezado del Excel; la selección se resolvió confirmando los nueve campos de la hoja principal. Hay vacíos en clase, subclase, estado y notas, y el nombre de personaje no es una clave única.
- `RANGO` combina 199 fórmulas con resultados guardados y 4 valores directos. Se leen sus resultados guardados y valores directos, sin recalcular ni sobrescribir la fuente. Los detalles y la limitación de la fórmula base constan en `SPEC.md`.
- La inspección no encontró hipervínculos ni enlaces externos. Las filas ocultas de la hoja principal no contienen registros adicionales.

## Detalles resueltos en implementación
- Borrar el nombre retira solo ese criterio; los filtros se combinan con AND. La búsqueda conserva diferencias de acentos.
- Selectores con valores reales no vacíos; vacíos visibles como raya accesible “Sin dato”, al final de las ordenaciones. No se completan datos.
- Rango en orden alfabético español, sin inferir jerarquía de juego. Solo se muestra la hoja principal, sin enriquecimiento de catálogos.
- Cada recarga vuelve a solicitar el Excel sin caché ni polling. El responsable de datos actualiza el fichero servido fuera de la web.
- Menú mínimo con enlaces internos a registro y filtros. Presentación de papel/tinta, logo provisional y tabla desplazable en móvil.

## Verificación y límites
Prueba de datos con Node.js y Excel real: 203 registros y nueve campos fieles, vacíos, nombres repetidos, fórmulas guardadas, valores directos, orden numérico estable, búsqueda y filtros AND. Chrome verificó interacción, teclado, móvil, errores y recuperación, sin errores JavaScript; vistas revisadas a 1440 × 1000 y 390 × 844. El Excel conserva SHA256 `8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f`.

No se ha probado un lector de pantalla real ni todos los navegadores; las fórmulas no se recalculan. No se ha desplegado hosting ni definido un flujo con múltiples agentes.

La cuenta de las credenciales Git del terminal no tiene permiso de push sobre `catirito/NidoDelCuervo`; la conexión del plugin GitHub sí confirma permiso de escritura y se utiliza para publicar conservando el historial remoto. No se modifican credenciales ni configuración global.
