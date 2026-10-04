# NidoDelCuervo

Web de personajes con HTML, CSS y JavaScript sin frameworks. La especificación 004 añade edición de niveles y rango automático; 005 amplía a nombre, notas, estado y propietario; 006 añade clase, subclase y especie con catálogos persistentes. El guardado por lotes es atómico mediante Pages Functions y D1. El Excel original es histórico de solo lectura y fuente de importación inicial; D1 es la fuente activa tras importar.

## Ejecutar la versión 004 en local

Usar Node moderno (24 verificado) y Wrangler 4 ya disponible. No hace falta instalar dependencias de la aplicación.

```sh
node scripts/build-cloudflare.mjs
wrangler d1 migrations apply DB --local
node scripts/import-characters.mjs .local/import.sql
wrangler d1 execute DB --local --file .local/import.sql
wrangler pages dev --port 8788 --ip 127.0.0.1
```

Abrir [la aplicación local](http://127.0.0.1:8788). La configuración usa un identificador exclusivamente local y `remote: false`. No hay recursos D1 remotos creados ni cambios publicados. La importación se ejecuta una sola vez sobre una base vacía; el generador rechaza sobrescribir el SQL y la base rechaza una segunda importación. En visitas posteriores bastan preparación de archivos y `wrangler pages dev`. El estado D1 local está en `.wrangler/`, ignorado por Git; no borrarlo para mantener las ediciones locales.

El servidor HTTP estático de versiones anteriores ya no ejecuta la API. Servir únicamente `.local/public`, nunca la raíz del repositorio. El script permite también una salida nueva fuera del proyecto. El paquete contiene una lista explícita de archivos, sin Excel, SQL ni documentación; el empaquetado no importa datos ni escribe en D1.

## Editar niveles

Editar habilita controles compactos de más y menos a la derecha del nivel, con paso de uno y límites 1–20. Los cambios son locales hasta Guardar; volver al nivel original retira el cambio. El rango se previsualiza según umbrales 1, 3, 5, 9, 13 y 17 y el servidor lo calcula de nuevo al guardar. Guardar envía solo personajes modificados en una petición. Sin cambios, vuelve a consulta sin escribir.

`GET /api/characters` consulta los nueve campos, UUID v4 estable, fila de origen y versión. `PATCH /api/characters/batch` recibe `{changes: [{id, expectedVersion, fields: {NIVEL}}]}`. En 006 admite NIVEL, PERSONAJE, NOTAS, ESTADO, PROPIETARIO, CLASS, SUBCLASS y SPECIE. No admite rango manual ni campos internos. Propietario y estado siguen como texto en characters; no hay tablas relacionadas. El guardado es atómico: si una versión está obsoleta o algún dato falla, no escribe ningún cambio del lote. No hay contraseña ni sesiones, según la decisión del usuario.

Un conflicto conserva el borrador. Actualizar y revisar consulta el estado guardado, muestra nivel actual y propuesta y permite volver a Guardar tras revisión. Una respuesta perdida también exige actualizar antes de repetir; si el nivel deseado ya está guardado, se retira del borrador. No hay reintentos automáticos. Recargar antes de guardar pierde el borrador; el navegador avisa cuando hay cambios pendientes.

## Validación local de 004

Con la aplicación local en ejecución:

```sh
node tests/records.test.mjs
node tests/api.test.mjs http://127.0.0.1:8788
node tests/character-editing.test.mjs http://127.0.0.1:8788
node tests/ui.test.cjs http://127.0.0.1:8788
node tests/character-editing-ui.test.cjs http://127.0.0.1:8788
```

La prueba de UI usa Playwright y Chrome existentes; si Playwright está fuera de la resolución habitual, indicar su ruta mediante `PLAYWRIGHT_MODULE`. No se añade una dependencia al proyecto. API y UI rechazan destinos que no sean localhost. Las pruebas escriben en D1 local y restauran los niveles de partida; las versiones avanzan. La prueba API compara con el Excel los registros cuya versión sigue a cero; respeta como estado de partida las ediciones locales existentes y las restaura al terminar. Las pruebas comprueban importación, rangos, errores, concurrencia, atomicidad, borrador, recuperación de conflictos/respuesta perdida, filtros, temas y móvil. No ejecutar tests en producción.

## Histórico, recuperación y publicación pendiente

Conservar el Excel original intacto en privado; permite recuperar el estado inicial, no cambios posteriores. Una recuperación inicial requiere una nueva base vacía, nueva importación y revisión antes de cambiar el binding: genera nuevas identidades y obliga a recargar todos los clientes. No restaurar ni borrar la base activa sin autorización.

D1 remoto gratuito dispone de Time Travel de siete días según [la documentación oficial](https://developers.cloudflare.com/d1/reference/time-travel/). Antes de una restauración: detener la edición, exportar el estado actual, revisar el momento de recuperación y pedir autorización para la operación destructiva. Después, comprobar datos fuera de producción y hacer que todos los clientes recarguen; las versiones de snapshots antiguos no sirven tras restaurar. D1 local no proporciona este histórico remoto. La ubicación de una copia privada adicional del Excel sigue pendiente.

La publicación de 004 queda aplazada para la revisión local. Al autorizarla, crear D1 dentro de cuotas gratuitas, usar su identificador real en la configuración, aplicar migración e importar una sola vez; revisar binding y empaquetar Pages Functions con Wrangler. No publicar con el identificador local de ejemplo, reimportar en despliegues ni integrar en main sin autorización. Se conserva el proyecto Pages y las instrucciones noindex. [Desarrollo local de Pages](https://developers.cloudflare.com/pages/functions/local-development/).

## Consulta

- Muestra los nueve campos de la hoja `Nido del Cuervo`; el archivo actual contiene 203 registros. Los catálogos ocultos no se muestran como tablas.
- Empieza con `NIVEL` numérico de mayor a menor y conserva el orden del Excel en empates.
- Busca inmediatamente por cualquier fragmento de `PERSONAJE`, sin distinguir mayúsculas/minúsculas. Conserva las diferencias de acentos y no busca en otros campos.
- Los filtros de clase, subclase, especie, rango y propietario se combinan con AND, también con el nombre. Borrar el nombre retira solo ese criterio. «Limpiar filtros» retira todos los filtros y conserva la ordenación elegida.
- Los encabezados de esos cinco campos alternan orden ascendente/descendente. El rango se ordena alfabéticamente en español, sin deducir una jerarquía de juego. Los empates conservan la fila original y los vacíos quedan al final en ambos sentidos.
- Los vacíos aparecen como una raya con texto accesible «Sin dato», sin alterar los valores. Los selectores contienen valores reales no vacíos; «Todas/Todos» incluye también filas con ese campo vacío.
- En 004 `RANGO` se calcula desde el nivel al importar y al guardar; el Excel mantiene sus fórmulas y resultados intactos. Los errores de carga y la ausencia de coincidencias tienen estados distintos.

## Archivos

`index.html` define la estructura; `styles.css` la presentación; `app.js` conecta los controles y la carga; `theme.js` gestiona el tema sin modificar la consulta; `records.js` contiene lectura y operaciones de datos. El logo está en `assets/logo-cuervo.png`, preparado desde la imagen aportada por el usuario; procedencia y prompt en `assets/logo-cuervo-README.md`. SheetJS CE 0.20.3 se sirve desde `vendor/`, con licencia y procedencia en `vendor/README.md`; no hay CDN en ejecución.

## Comprobaciones

Con Node.js disponible, desde la raíz:

```sh
node tests/records.test.mjs
```

La prueba usa la biblioteca local y el Excel real: nueve campos, conteo, vacíos, resultados guardados, valores directos, orden numérico estable, búsquedas parciales, filtros AND y errores de esquema. El hash comprobado corresponde a la fuente auditada; si el responsable cambia legítimamente el Excel, habrá que revisar los conteos y actualizar esa referencia de prueba.

También se ha validado en Chrome: búsqueda por inicio/medio/final, mayúsculas, combinación de filtros, ordenación con teclado, recarga, errores HTTP y recuperación, tabla desplazable en móvil y foco visible. La revisión visual se realizó a 1440 × 1000 y 390 × 844. No se ha realizado una prueba con lector de pantalla real ni una revisión de todos los navegadores.

Las reglas están en `AGENTS.md`, las decisiones en `Memories.md`, los requisitos en `specs/001-registro-personajes/spec.md`, el plan en `specs/001-registro-personajes/plan.md` y las tareas en `specs/001-registro-personajes/tasks.md`. El rediseño 002 está integrado en `main` y publicado en [Nido del Cuervo](https://nido-del-cuervo.catirito.chatgpt.site), con acceso privado.

## Diseño visual 002 — publicado
Tema oscuro con carbón, pizarra, texto plateado y acentos púrpura; controles con radio de 10 px y tabla con radio de 14 px. Cabecera compacta, sin menú ni contador superior. El estado de resultados junto a la tabla se conserva. Requisitos, plan y tareas en `specs/002-diseno-visual/`.

El usuario revisó y aprobó la implementación; los once commits se integraron mediante [el pull request del rediseño](https://github.com/catirito/NidoDelCuervo/pull/1). La prueba de datos y la revisión en Chrome pasan; se comprobaron ausencia de menú/contador, radios, acceso a la tabla, contraste de texto sobre fondo y superficies, teclado, móvil y recuperación ante errores. El Site publica esta versión del rediseño.

### Tipografía
Cinzel en nombre y títulos, Roboto Flex en controles y tabla. Ambas fuentes se sirven localmente con `font-display: swap` y respaldo; archivos, licencias OFL 1.1, fuentes y hashes en `assets/fonts/README.md`. Carga real y ausencia de solicitudes externas verificadas en Chrome; revisión a 320, 390 y 1440 px sin desbordamiento de página.

## Selector de tema 003 — revisión local

El botón arriba a la derecha muestra solo el icono del tema activo: luna en oscuro y sol en claro. El texto «Tema claro» o «Tema oscuro» permanece visualmente oculto como nombre accesible dinámico. El tema claro usa gris muy claro, texto oscuro y acentos púrpura/plateados; conserva logo y fuentes.

Sin elección manual válida, la web utiliza el tema del sistema y sigue sus cambios mientras está abierta. Elegir manualmente tiene prioridad y se recuerda en el mismo navegador y origen mediante `localStorage` (clave `nido-del-cuervo-theme`). Si el almacenamiento está bloqueado, el botón funciona y la elección manda durante la sesión, pero no puede persistir entre visitas. No hay control para volver al modo automático.

Chrome headless verifica ambos temas, seguimiento del sistema emulado, persistencia, valor inválido/almacenamiento bloqueado, iconos y nombre accesible, teclado/foco, consulta y estados, sin errores de página. Vistas de 1440, 390 y 320 px revisadas en ambos temas; contraste activo mínimo de 5,24:1 en claro y 4,64:1 en oscuro. La prueba de datos pasa y el Excel conserva su hash. Evidencia detallada y límites en `specs/003-selector-tema/tasks.md`; sin prueba de lector de pantalla real ni todos los navegadores. Revisión local pendiente; el Site conserva la versión 002.

Presentación final confirmada: icono discreto de 16 px, sin borde permanente, fondo marcado ni contenedor decorativo; área invisible de interacción de 44 × 44 px. Hover mediante cambio de color y foco visible al teclado.

Entrega 003 autorizada: el usuario aprobó el resultado final y autorizó commit, push de `codex/003-selector-tema` y despliegue al Site privado existente. No autorizó integración en `main`. Esta decisión supera las referencias anteriores a revisión pendiente y prohibición de publicación. Entrega confirmada el 3 de octubre de 2026: rama publicada con commit `ea3048995809c43b9afb7819adc8416c714bc3ef`, sin integrar en `main`. Sites confirmó `succeeded` en https://nido-del-cuervo.catirito.chatgpt.site, conservando acceso privado. Despliegue `appgdep_6ac1587b638c8191b742aaa414717f92`, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_17ea56251e288191808f785ce13a1b18`, fuente de Sites `1d3026eda0b04ca25bec80831800b3d773a0b9dd`. Excel intacto. Las notas previas de revisión pendiente describen etapas ya superadas.

## Edición de textos — 005 local
Nombre obligatorio, máximo 50 caracteres. Notas opcionales, máximo 2.000 caracteres y saltos de línea preservados. Estado y propietario opcionales, máximo 50 caracteres, con selector existente y opción de introducir texto nuevo. Los límites cuentan puntos de código Unicode de forma consistente en cliente y servidor. Estado/propietario eliminan espacios exteriores y reutilizan la grafía existente al coincidir sin distinguir mayúsculas; no fusionan otras filas ni ignoran acentos. Los valores nuevos del mismo lote comparten la primera grafía normalizada. Las opciones se derivan de personajes: si nadie usa un valor, desaparece al actualizar.

Los campos omitidos se conservan y los vacíos opcionales se guardan como null. Rango solo se recalcula al cambiar nivel. La API admite hasta 203 personajes y 3 MiB por petición, suficiente para los límites acordados incluso con caracteres escapados. La búsqueda/filtros de edición se aplican sobre el snapshot guardado: editar nombre/propietario no oculta la fila hasta Guardar. Cambiar filtros explícitamente conserva el borrador de filas ocultas.

Un conflicto muestra valores guardados y propuestos de los campos pendientes; actualizar no descarta cambios locales diferentes. Tras una respuesta perdida se retiran los campos que ya coinciden con lo guardado antes de reenviar. La normalización reutiliza las opciones leídas en la petición y las nuevas del lote; sin catálogo independiente no impone unicidad global a altas simultáneas en personajes distintos. No hay migración, reimportación ni creación de recursos remotos de 005. Commit local autorizado; sin push ni publicación.

## Catálogos — 006 local
Clases y especies tienen tablas independientes con UUID, nombre y clave normalizada única. Subclases tienen UUID y FK a clase, con nombre único dentro de esa clase. Los campos de texto de personajes se conservan para mantener el contrato. GET devuelve characters y catalogs: classes, subclasses (classId), species; todas las opciones están disponibles aunque nadie las use.

Para una base local nueva, después de importar personajes y antes de editar:

```sh
wrangler d1 execute DB --local --command 'SELECT * FROM characters ORDER BY sourceRow' --json > .local/catalog-source-characters.json
node scripts/import-catalogs.mjs .local/catalog-source-characters.json .local/import-catalogs.sql
wrangler d1 execute DB --local --file .local/import-catalogs.sql
```

Las migraciones se aplican con el comando ya indicado al iniciar. La carga lee Classes/Species en el Excel y concilia con personajes actuales. Importa 15 clases, 150 relaciones de subclase y 179 especies; incluye Ranger–Phantom y Rogue–Phantom. Corrige Ágios, sourceRow 49, a Paladin–Oath of Devotion únicamente tras comprobar su identidad/estado, manteniendo UUID y demás datos e incrementando versión. SQL verifica además versión antes de aplicar; estado inesperado o catálogos ya cargados abortan la transacción. El Excel se mantiene intacto. No reimportar personajes ni catálogos al preparar archivos o publicar.

En edición, clase/subclase/especie usan selectores completos y opción nueva con input debajo, máximo 50 puntos de código Unicode. Sin clase no hay subclase seleccionable; cambiar clase limpia la incompatible y conserva una que sea válida en ambas. Las nuevas subclases se vinculan a la clase elegida, no globalmente por nombre. Se quitan espacios exteriores y se reutiliza grafía existente comparando sin mayúsculas, sin quitar acentos.

PATCH admite catalogAdditions opcional: `{classes: [nombre], subclasses: [{className, name}], species: [nombre]}`. El frontend lo deriva exclusivamente de opciones nuevas necesarias en los campos finales modificados. Se rechazan altas independientes y subclases incompatibles sin declaración nueva. Inserts de catálogo y UPDATE de personajes comparten una transacción D1 batch; cada insert y el UPDATE exigen coincidencia de todas las versiones. Un conflicto no crea opciones; un fallo de sentencia revierte todo. Claves únicas y resolución de grafía dentro del UPDATE evitan duplicación y grafías divergentes al crear opciones simultáneamente.

Si otra persona cambia la clase durante edición de subclase, actualizar conserva la propuesta pero exige revisar su relación; no vincula una subclase nueva automáticamente a una clase distinta de aquella donde se introdujo.

Pruebas adicionales, exclusivamente contra localhost:

```sh
node tests/catalogs.test.mjs http://127.0.0.1:8788
node tests/catalogs-ui.test.cjs http://127.0.0.1:8788
```

Utilizan Miniflare existente con Wrangler y, para UI, Playwright/Chrome existentes. Si están fuera de resolución habitual, indicar sus rutas con MINIFLARE_MODULE y PLAYWRIGHT_MODULE; no se han instalado dependencias nuevas. Las pruebas comprueban catálogos, relaciones, opciones sin uso, normalización, concurrencia y rollback forzado. Restauran personajes y eliminan únicamente opciones con prefijo aleatorio creado por la prueba en D1 local. No ejecutarlas en producción.

006 está implementada y validada en local, sin commit, push, recursos remotos ni publicación autorizados. No se han comprobado todos los navegadores ni lectores de pantalla reales.

## Publicación conjunta 004–006

Publicación autorizada el 4 de octubre de 2026 en https://nido-del-cuervo.pages.dev con D1 `nido-personajes`. `wrangler.production.jsonc` identifica la base remota; `wrangler.jsonc` conserva el entorno local aislado. El primer despliegue carga el snapshot validado una sola vez; los siguientes no deben importar datos. Las referencias anteriores a publicación pendiente describen etapas superadas. No se ejecutan tests en producción.
