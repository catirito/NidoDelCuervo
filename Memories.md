# Memoria del proyecto

## Propósito
Recoger decisiones confirmadas y sus motivos para retomar el trabajo con contexto. Las reglas estables están en `AGENTS.md`; este archivo no las sustituye ni las duplica. `Memories.md` es una convención de este proyecto, no un mecanismo automático ni un estándar universal.

## Etapa actual
La especificación 003 está implementada, validada, aprobada por el usuario y publicada en el Site privado existente. La rama `codex/003-selector-tema` está publicada en GitHub y continúa separada de `main`, cuya integración no está autorizada. Documentos en `specs/003-selector-tema/`; entrega confirmada al final de esta memoria.

La especificación 002 está implementada, validada, revisada por el usuario e integrada en `main` mediante el PR https://github.com/catirito/NidoDelCuervo/pull/1. El rediseño púrpura/plateado con logo nuevo y fuentes locales está publicado en https://nido-del-cuervo.catirito.chatgpt.site, conservando acceso privado. La rama `codex/002-diseno-visual` sigue existente; no se ha solicitado su eliminación.

## Especificación 003: selector de tema
Decisiones confirmadas: un botón arriba a la derecha alternará entre aspecto claro y oscuro. La elección manual se recordará en próximas visitas del mismo navegador y tendrá prioridad sobre la configuración del sistema. Cuando no exista una elección manual guardada se usará la configuración del sistema y se seguirán automáticamente sus cambios mientras la web esté abierta. Una elección manual impide que esos cambios sustituyan el tema elegido. Se conserva la funcionalidad de consulta y la identidad de la web.

Clarificación confirmada: el tema claro tendrá fondo gris muy claro, texto oscuro y los mismos acentos púrpura/plateados. Durante la revisión, el usuario sustituyó el texto visible por un botón solo con icono: oscuro activo → luna; claro activo → sol. Esta preferencia confirmada sustituye la semántica anterior de icono de destino. Presentación final confirmada: icono discreto de 16 px, sin borde permanente, fondo marcado ni contenedor decorativo; área invisible de interacción de 44 × 44 px. Hover mediante cambio de color y foco visible al teclado. Se conservan los nombres accesibles dinámicos «Tema claro» y «Tema oscuro» mediante texto visualmente oculto. La clarificación queda resuelta; los valores cromáticos exactos y el dibujo de los iconos se concretarán dentro de esta dirección en el plan autorizado como propuestas ajustables tras comprobar contraste. No se han acordado nuevos controles. El plan aprovecha las variables CSS existentes y prevé `theme.js` separado de la consulta, preferencia manual en `localStorage` y seguimiento del sistema mediante `matchMedia`, con tolerancia a almacenamiento bloqueado. La implementación autorizada está completada y validada; evidencia y límites en `specs/003-selector-tema/tasks.md`. Chrome comprobó ambos temas, prioridad/persistencia, seguimiento automático, almacenamiento bloqueado, teclado, consulta y móvil a 1440, 390 y 320 px; prueba de datos y hash del Excel pasan. No se ha probado un lector de pantalla real, todos los navegadores ni un cambio real del sistema operativo. Con almacenamiento bloqueado no se puede persistir entre visitas. Revisión del usuario pendiente; commits, push y publicación del Site siguen sin autorización.

## Decisiones confirmadas
- El objetivo pedagógico es aprender desarrollo con IA paso a paso mediante una web simple; se avanza en etapas pequeñas para comprender cada decisión.
- Se ha elegido HTML, CSS y JavaScript sin frameworks y en archivos separados, para mantener clara la separación entre estructura, presentación y lógica.
- `Registro de personajes.xlsx` es la única fuente de datos y se utiliza solo en lectura, para conservar el registro original.
- El usuario prefiere código autoexplicativo sin comentarios; la intención se expresa con nombres y estructura, y los motivos se documentan fuera del código.
- Se adopta la secuencia del curso: constitución → especificación → clarificación → planificación → tareas → implementación → validación. `AGENTS.md` recoge reglas operativas y principios que contribuyen a la constitución; esta memoria conserva decisiones. La secuencia es la metodología elegida para el proyecto, no una exigencia universal de SDD.
- Se ha elegido la Frontend Skill de OpenAI como orientación para futuras tareas de diseño visual, con alcance exclusivo de este proyecto. Instalación local verificada el 1 de octubre de 2026 en `.agents/skills/frontend-skill/`, con `SKILL.md`, `agents/openai.yaml` y `LICENSE.txt`, sin dependencias obligatorias. Procede de `openai/skills`, ruta `skills/.curated/frontend-skill`, commit `30444aed500c00c85294d12074f6e3ee794f808a`, anterior a su retirada del catálogo el 23 de abril de 2026. Fuente: https://github.com/openai/skills/tree/30444aed500c00c85294d12074f6e3ee794f808a/skills/.curated/frontend-skill. Se conserva la versión oficial sin modificar; su orientación se adapta a las restricciones de `AGENTS.md`. Su aparición en el catálogo de esta sesión está verificada; la presentación de registro está implementada y verificada visualmente.

- La web mostrará una tabla de personajes de D&D con una presentación bonita y estructurada, permitirá ordenar y filtrar, y tendrá un logo de cuervo o de Nido del Cuervo sobre el menú. Los campos solicitados y las dudas están recogidos en `specs/001-registro-personajes/spec.md`.
- Tras conocer los encabezados, el usuario confirmó mostrar los nueve campos de la hoja principal: `PERSONAJE`, `CLASS`, `SUBCLASS`, `SPECIE`, `NIVEL`, `RANGO`, `ESTADO`, `PROPIETARIO` y `NOTAS`. Esta decisión no incluye mostrar los catálogos auxiliares como tablas ni rellenar datos vacíos.
- Se ha autorizado elaborar el plan manteniendo las decisiones no resueltas como pendientes. Los detalles menores se resolvieron durante la implementación autorizada; el comportamiento actual está en `specs/001-registro-personajes/spec.md` y `README.md`.
- El usuario solicita controles básicos de filtrado y ordenación por clase, subclase, especie, rango y propietario, sin filtros avanzados. No ha solicitado filtros adicionales de nivel o estado.
- El usuario confirma lógica AND entre todos los filtros activos, incluida la búsqueda parcial por `PERSONAJE`: cada fila debe cumplir todos los criterios.
- El filtro de nombre debe actualizarse inmediatamente desde la primera letra y mostrar nombres que contengan el texto en cualquier posición, sin botón obligatorio y sin buscar en otros campos. Filtrar y ordenar solo cambia la vista, no el Excel.
- El orden inicial será por `NIVEL` numérico descendente, con los niveles más altos primero, siguiendo la intención de orden del Excel.
- La búsqueda parcial inmediata por `PERSONAJE` no distingue mayúsculas/minúsculas, confirmado por el usuario; se mantiene la combinación AND.
- Está confirmado servir web y Excel juntos como página estática; se ha elegido Sites por petición del usuario, con acceso privado inicial.
- La carpeta está vinculada mediante Git local con rama inicial `main` y `origin` en `https://github.com/catirito/NidoDelCuervo.git`. El commit inicial remoto con `README.md` se integró por avance rápido preservando los archivos locales. El usuario autorizó commit y push de la solución; fetch por transporte Git ya está verificado.
- En empates de `NIVEL` se conservará el orden original de las filas del Excel, confirmado por el usuario.
- La lectura será directa del XLSX mediante SheetJS Community Edition, en una copia local con versión fija y licencia, sin framework. La biblioteca está incorporada como versión 0.20.3, obtenida del repositorio oficial con licencia; procedencia y hashes en `vendor/README.md`.
- El Excel se cargará automáticamente al abrir la web desde una ruta relativa servida junto a ella, sin selector manual. Se necesitará servir web y Excel por HTTP local o hosting estático para `fetch`, sin depender de `file://`. El comando HTTP local probado está en `README.md`; el despliegue en Sites está completado.
- La Frontend Skill ya aparece en el catálogo de esta sesión, verificado el 1 de octubre de 2026. La presentación de la web está implementada y revisada en escritorio y móvil.
- El usuario autorizó crear un logo temporal original: `assets/logo-cuervo.svg`, monocromo oscuro sobre fondo transparente, fácil de reemplazar. Asset creado y sintaxis/verificación visual comprobadas a 256 y 32 píxeles. El logo está integrado y la tarea de presentación está completada con revisión de la web.

## Hallazgos verificados
- El Excel contiene 203 registros en `Nido del Cuervo` y dos catálogos ocultos: `Species` (179 filas) y `Classes` (149 filas). Los encabezados y la correspondencia con los campos solicitados están documentados en `specs/001-registro-personajes/spec.md`.
- “Detalles personales” no es un encabezado del Excel; la selección se resolvió confirmando los nueve campos de la hoja principal. Hay vacíos en clase, subclase, estado y notas, y el nombre de personaje no es una clave única.
- `RANGO` combina 199 fórmulas con resultados guardados y 4 valores directos. Se leen sus resultados guardados y valores directos, sin recalcular ni sobrescribir la fuente. Los detalles y la limitación de la fórmula base constan en `specs/001-registro-personajes/spec.md`.
- La inspección no encontró hipervínculos ni enlaces externos. Las filas ocultas de la hoja principal no contienen registros adicionales.

## Detalles resueltos en implementación
- Borrar el nombre retira solo ese criterio; los filtros se combinan con AND. La búsqueda conserva diferencias de acentos.
- Selectores con valores reales no vacíos; vacíos visibles como raya accesible “Sin dato”, al final de las ordenaciones. No se completan datos.
- Rango en orden alfabético español, sin inferir jerarquía de juego. Solo se muestra la hoja principal, sin enriquecimiento de catálogos.
- Cada recarga vuelve a solicitar el Excel sin caché ni polling. El responsable de datos actualiza el fichero servido fuera de la web.
- Menú mínimo con enlaces internos a registro y filtros. Presentación de papel/tinta, logo provisional y tabla desplazable en móvil.

## Verificación y límites
Prueba de datos con Node.js y Excel real: 203 registros y nueve campos fieles, vacíos, nombres repetidos, fórmulas guardadas, valores directos, orden numérico estable, búsqueda y filtros AND. Chrome verificó interacción, teclado, móvil, errores y recuperación, sin errores JavaScript; vistas revisadas a 1440 × 1000 y 390 × 844. El Excel conserva SHA256 `8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f`.

No se ha probado un lector de pantalla real ni todos los navegadores; las fórmulas no se recalculan. El despliegue en Sites está completado. No se ha definido un flujo con múltiples agentes.

La cuenta de las credenciales Git del terminal no tiene permiso de push sobre `catirito/NidoDelCuervo`; la conexión del plugin GitHub sí confirma permiso de escritura y se utiliza para publicar conservando el historial remoto. No se modifican credenciales ni configuración global.

## Publicación online
El Site asociado es `appgprj_6abe80aea354819180edc5e0c3f12bab`, registrado como Nido del Cuervo. La configuración se conserva en `.openai/hosting.json`; web y Excel se empaquetan juntos sin modificar la fuente. El Site comienza privado para la cuenta del usuario. GitHub contiene la solución publicada en el commit `033063a9a02c5c53607e7bdd657c22e376c1f5e4`.

Publicación confirmada por Sites el 1 de octubre de 2026: https://nido-del-cuervo.catirito.chatgpt.site (privada). Despliegue `appgdep_6abe813508248191a3761ee6e892e3c7`, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_c3b4386584388191a0104d0397182743`, fuente `c8a82905ee7628bd99b6c1b1598cc262764cd36b`. La copia de publicación en `/private/tmp/nido-sites-source` usa el repositorio de Sites; `origin` de la carpeta principal sigue en GitHub. Para futuras publicaciones, reutilizar el project_id y recuperar la fuente de Sites si esa copia temporal ya no existe.

## Organización de documentos
El usuario confirma una carpeta por funcionalidad dentro de `specs/`, con número correlativo de tres cifras y nombre descriptivo. El registro de personajes queda en `specs/001-registro-personajes/`, con `spec.md`, `plan.md` y `tasks.md`. Se conservaron los contenidos y se actualizaron las referencias; las rutas se expresan desde la raíz del proyecto.

## Nueva especificación de diseño
La funcionalidad 002 trata la mejora del diseño visual. Dirección confirmada: fantasía medieval, colores oscuros inspirados en D&D Beyond. El primer paso se centra en la temática de colores; el usuario solicitó una propuesta de paleta. Se propuso carbón, pizarra y blanco hueso; el usuario confirmó sustituir el rojo por dorado. También pide un estilo más moderno y suave con esquinas redondeadas. Los colores exactos y el tratamiento concreto siguen pendientes de clarificación. Los colores concretos y el resto del alcance están pendientes de clarificación. No se ha modificado la web.

El usuario confirma como regla estable que cada nueva especificación tenga su propia rama desde el inicio y durante todas sus etapas. Regla incorporada en `AGENTS.md`; la especificación 002 continúa en su rama de diseño y entra en clarificación por autorización explícita.

Clarificación de la especificación 002: retirar el total de personajes de arriba a la derecha y el menú actual, dando acceso más directo a la tabla. El usuario no solicita otras reorganizaciones por ahora. Se conservan búsqueda, filtros, ordenación, nueve campos y estados de consulta; el estado de resultados junto a la tabla es distinto del contador de cabecera. El plan y las tareas del rediseño todavía no se han creado.

Etapa actual de la especificación 002: planificación autorizada y elaborada en `specs/002-diseno-visual/plan.md`. Incluye tema oscuro/dorado, radios suaves, retirada conjunta del contador en HTML y sus referencias JavaScript, retirada del menú, cabecera compacta y validación de contraste y comportamiento. Tareas e implementación pendientes; la web publicada conserva el diseño actual.

Etapa actual de la especificación 002: tareas desglosadas por autorización del usuario en `specs/002-diseno-visual/tasks.md`. Siete tareas pendientes abarcan paleta, retirada conjunta de menú/contador y referencias, composición compacta, bordes suaves, validación funcional, revisión visual y entrega en la rama de diseño. Implementación todavía no iniciada.

Implementación de la especificación 002 autorizada: hacer commits locales separados por cambio y no hacer push. El usuario revisará primero la web en local. No actualizar el Site durante esta revisión.

Validación final de diseño 002: prueba de datos existente y Chrome pasan, Excel intacto, nueve campos conservados, sin menú ni contador de cabecera, contraste comprobado, teclado y móvil operables. Los cambios se han separado en commits locales. Revisión local en http://127.0.0.1:8765; sin push ni despliegue.

Ampliación tipográfica 002 autorizada e implementada: Cinzel para nombre/títulos y Roboto Flex para tabla/controles. D&D Beyond usa Majesty y Roboto Flex en su portada inspeccionada; Cinzel se aprueba como aproximación temática. Copias originales de Google Fonts con licencias OFL 1.1 y procedencia en `assets/fonts/README.md`. Ambas cargan localmente sin solicitudes externas; Chrome verifica comportamiento y ajuste a 320, 390 y 1440 px. Cambio en commit separado; continúa la prohibición de push y despliegue hasta revisión del usuario.

Revisión de identidad autorizada: logo aportado en `/Users/bruno/Downloads/cuervos1.png`, sustituir logo y adaptar el dorado a púrpura con tonos plateados. ImageGen prepara fondo exterior transparente, conservando cuervo, aro violáceo y disco plateado. `assets/logo-cuervo.png` reemplaza el SVG en cabecera y favicon, sin modificar el original del usuario. Nueva paleta validada por Chrome con contraste y comportamiento; continúa sin push ni despliegue.

## Entrega confirmada de diseño 002
PR integrado con merge `1f9d7346f350885958fe7b34e5835f1a256bacb4`, conservando los once commits separados. GitHub impidió una aprobación formal del propio autor; el usuario aprobó la integración en el chat. Despliegue de Sites `appgdep_6abe918e50508191a3cc339651fa1e86` confirmado como succeeded, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_ec824e59bc3c819184a70e22779b14d0`, fuente de Sites `34959e7482ed081e8551c3f1d669f854e5a101b8`. Excel intacto; publicación privada. Las referencias anteriores a revisión local pendiente y prohibición de push describen etapas anteriores y han quedado superadas por esta autorización.

Entrega 003 autorizada: el usuario aprobó el resultado final y autorizó commit, push de `codex/003-selector-tema` y despliegue al Site privado existente. No autorizó integración en `main`. Esta decisión supera las referencias anteriores a revisión pendiente y prohibición de publicación. Entrega confirmada el 3 de octubre de 2026: rama publicada con commit `ea3048995809c43b9afb7819adc8416c714bc3ef`, sin integrar en `main`. Sites confirmó `succeeded` en https://nido-del-cuervo.catirito.chatgpt.site, conservando acceso privado. Despliegue `appgdep_6ac1587b638c8191b742aaa414717f92`, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_17ea56251e288191808f785ce13a1b18`, fuente de Sites `1d3026eda0b04ca25bec80831800b3d773a0b9dd`. Excel intacto. Las notas previas de revisión pendiente describen etapas ya superadas.
