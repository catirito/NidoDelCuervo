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

