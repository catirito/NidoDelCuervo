# Nido del Cuervo — arquitectura implementada

Plan completado mediante `TASKS.md`, con implementación y validación autorizadas por el usuario. Requisitos en `SPEC.md` y reglas en `AGENTS.md`.

## Estructura
- `index.html`: cabecera con logo provisional sobre el menú, filtros y tabla semántica de nueve campos.
- `styles.css`: tonos de papel/tinta, tipografía legible, foco visible y tabla desplazable en móvil.
- `app.js`: carga automática, controles y renderizado seguro mediante texto, sin insertar HTML procedente del Excel.
- `records.js`: lectura y validación, filtros AND y ordenación de copias de la vista.
- `assets/logo-cuervo.svg`: logo original temporal ya integrado.
- `vendor/`: SheetJS CE 0.20.3 local sin modificaciones, licencia y procedencia.
- `tests/records.test.mjs`: verificación con el Excel real sin modificarlo.

HTML, CSS y JavaScript separados, sin frameworks, sin comentarios en código propio. No hay backend ni decisión de hosting.

## Lectura y fidelidad
Carga automática con `fetch` de `Registro de personajes.xlsx`, desde una ruta relativa servida junto a la web por HTTP. Cada recarga lo vuelve a solicitar con `cache: no-store`, sin polling ni selector manual. No se admite depender de `file://`; el comando HTTP probado está en `README.md`.

SheetJS es una biblioteca lectora, no un framework. Versión y licencia obtenidas del repositorio oficial, etiqueta `v0.20.3`; detalles y hashes en `vendor/README.md`. No hay CDN durante el uso.

Flujo: lectura → validación de hoja y nueve encabezados → preparación conservadora → filtros/ordenación de una vista → renderizado accesible.

Solo se lee `Nido del Cuervo` para la vista: 203 registros actuales. Se conservan textos, vacíos, niveles numéricos, nombres repetidos y fila original. Se omiten solo filas completamente vacías. Se usan los resultados guardados de 199 fórmulas de `RANGO` y los cuatro valores directos; no se recalcula ni guarda el libro. Su vigencia no está verificada por recálculo.

## Interacción
- Inicio por `NIVEL` numérico descendente; empates en orden de fila del Excel.
- Filtros básicos por clase, subclase, especie, rango y propietario, con valores reales no vacíos. Todos los criterios activos se aplican con AND, incluida la búsqueda por nombre.
- Nombre parcial inmediato desde una letra en cualquier posición, sin distinguir mayúsculas/minúsculas, conservando acentos y sin buscar en otros campos. Borrar el nombre retira solo ese criterio.
- Los encabezados de los cinco campos alternan orden ascendente/descendente. Rangos alfabéticos en español, sin inventar jerarquía. Vacíos al final y empates por fila original.
- Vacíos como raya con etiqueta accesible “Sin dato”. Estados distintos para carga, ausencia de coincidencias y fallo; reintento disponible tras error.

## Presentación y verificación
Se aplicó la Frontend Skill para una superficie de consulta: logo, título, menú mínimo, controles y tabla como área principal, sin estructura de landing comercial. Se conservaron los nueve campos en móvil con desplazamiento dentro de la tabla.

Pruebas de datos realizadas contra el libro real y comprobación SHA256. Chrome validó búsqueda en inicio/medio/final y mayúsculas, filtros combinados, ordenación mediante teclado, vacíos, recarga, fallo HTTP, esquema inválido y recuperación. Vistas revisadas a 1440 × 1000 y 390 × 844; no hay desbordamiento horizontal de la página.

Limitaciones: no se recalculan fórmulas, no se probó un lector de pantalla real ni todos los navegadores. No se ha publicado hosting. Comandos y comportamiento en `README.md`.
