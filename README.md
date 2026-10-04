# NidoDelCuervo

Web estática para consultar los personajes de D&D del Nido del Cuervo. Usa HTML, CSS y JavaScript sin frameworks y carga automáticamente `Registro de personajes.xlsx`, única fuente de datos y exclusivamente de lectura.

## Ejecutar localmente

Desde la raíz del proyecto, con Python 3 instalado:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abrir [http://127.0.0.1:8765](http://127.0.0.1:8765). Detener el servidor con `Ctrl+C`. Este comando se ha probado; no hace falta instalar dependencias de Python. No abrir `index.html` con `file://`: la lectura del Excel necesita HTTP.

La web y el Excel deben permanecer juntos. Cada recarga vuelve a solicitar el fichero sin caché; no hay polling. Para usar una versión nueva del registro, el responsable de los datos debe colocar el Excel actualizado en la misma ruta y recargar la página. La web nunca modifica, guarda ni recalcula el libro.

## Consulta

- Muestra los nueve campos de la hoja `Nido del Cuervo`; el archivo actual contiene 203 registros. Los catálogos ocultos no se muestran como tablas.
- Empieza con `NIVEL` numérico de mayor a menor y conserva el orden del Excel en empates.
- Busca inmediatamente por cualquier fragmento de `PERSONAJE`, sin distinguir mayúsculas/minúsculas. Conserva las diferencias de acentos y no busca en otros campos.
- Los filtros de clase, subclase, especie, rango y propietario se combinan con AND, también con el nombre. Borrar el nombre retira solo ese criterio. «Limpiar filtros» retira todos los filtros y conserva la ordenación elegida.
- Los encabezados de esos cinco campos alternan orden ascendente/descendente. El rango se ordena alfabéticamente en español, sin deducir una jerarquía de juego. Los empates conservan la fila original y los vacíos quedan al final en ambos sentidos.
- Los vacíos aparecen como una raya con texto accesible «Sin dato», sin alterar los valores. Los selectores contienen valores reales no vacíos; «Todas/Todos» incluye también filas con ese campo vacío.
- `RANGO` usa los resultados almacenados de 199 fórmulas y los cuatro valores directos. No se comprueba su vigencia mediante recálculo. Los errores de carga y la ausencia de coincidencias tienen estados distintos.

## Archivos

`index.html` define la estructura; `styles.css` la presentación; `app.js` conecta los controles y la carga; `records.js` contiene lectura y operaciones de datos. El logo está en `assets/logo-cuervo.png`, preparado desde la imagen aportada por el usuario; procedencia y prompt en `assets/logo-cuervo-README.md`. SheetJS CE 0.20.3 se sirve desde `vendor/`, con licencia y procedencia en `vendor/README.md`; no hay CDN en ejecución.

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
