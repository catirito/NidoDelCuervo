# Nido del Cuervo — especificación inicial

Estado: implementación validada según los criterios iniciales. La etapa actual se registra en `Memories.md`.

## Objetivo y alcance
Crear una web simple para consultar personajes de D&D en una tabla bonita y estructurada, con opciones para ordenar y filtrar. El proyecto sirve también para aprender desarrollo con IA paso a paso.

## Requisitos confirmados
- Usar HTML, CSS y JavaScript sin frameworks, en archivos separados, siguiendo las reglas de `AGENTS.md`.
- Utilizar `Registro de personajes.xlsx` como única fuente de datos y exclusivamente en lectura, sin modificarlo ni inventar información ausente.
- Mostrar los nueve campos de la hoja principal, selección confirmada por el usuario: `PERSONAJE`, `CLASS`, `SUBCLASS`, `SPECIE`, `NIVEL`, `RANGO`, `ESTADO`, `PROPIETARIO` y `NOTAS`. La correspondencia verificada es nombre → `PERSONAJE`, nivel → `NIVEL`, clase → `CLASS`, subclase → `SUBCLASS` y especie → `SPECIE`; los detalles adicionales se conservan mediante los otros cuatro campos, sin rellenar valores vacíos.
- Colocar el logo provisional original de cuervo `assets/logo-cuervo.svg` arriba del menú. Su creación está autorizada y el asset ya está creado: monocromo oscuro, fondo transparente y reemplazable; no es el diseño definitivo.
- Permitir ordenar y filtrar la tabla.
- Aplicar conjuntamente todos los criterios activos con lógica AND, incluida la búsqueda parcial por `PERSONAJE`: cada fila visible debe cumplirlos todos.
- Incluir controles básicos de filtrado y ordenación por clase (`CLASS`), subclase (`SUBCLASS`), especie (`SPECIE`), rango (`RANGO`) y propietario (`PROPIETARIO`), sin filtros avanzados.
- Filtrar dinámicamente por nombre (`PERSONAJE`) desde la primera letra: mostrar los nombres que contengan el texto en cualquier posición y actualizar al escribir, sin exigir un botón de búsqueda. No extender esta búsqueda a otros campos.
- La búsqueda por `PERSONAJE` no distingue mayúsculas/minúsculas; conserva la coincidencia parcial inmediata y la combinación AND.
- Servir web y Excel juntos como una página estática; el proveedor y la publicación no están decididos.
- Aplicar inicialmente orden numérico por `NIVEL` descendente, de mayor a menor.
- Conservar el orden original del Excel entre registros con el mismo nivel.
- Leer el XLSX directamente con SheetJS Community Edition, en una copia local con versión fija y licencia, sin framework.
- Cargar automáticamente `Registro de personajes.xlsx` al abrir la web desde una ruta relativa servida junto a ella, sin selector manual de archivo. Web y Excel se servirán por HTTP local o hosting estático para permitir la lectura con `fetch`; no depender de abrir `index.html` mediante `file://`.
- Cuidar la claridad visual, la accesibilidad y la adaptación a móvil.

## Estructura del Excel verificada
Inspección de solo lectura realizada el 1 de octubre de 2026. Los conteos excluyen encabezados y filas sin datos; no se han recalculado ni modificado fórmulas.

| Hoja | Estado en Excel | Registros con datos | Encabezados exactos |
| --- | --- | --- | --- |
| `Nido del Cuervo` | Visible | 203, filas 2–204 | `PERSONAJE`, `CLASS`, `SUBCLASS`, `SPECIE`, `NIVEL`, `RANGO`, `ESTADO`, `PROPIETARIO`, `NOTAS` |
| `Species` | Oculta | 179, filas 2–180 | `Raza / Variación`, `Tamaño`, `Fuente / Libro` |
| `Classes` | Oculta | 149, filas 2–150 | `Clase`, `Subclase`, `Fuente / Libro` |

Las dos hojas ocultas contienen catálogos de especies y clases/subclases, no registros de personajes. Los valores no vacíos de `CLASS`, `SUBCLASS` y `SPECIE` coinciden exactamente con sus catálogos. No se utilizan para enriquecer la vista en esta versión.

| Campo principal | Celdas vacías sobre 203 registros | Observación |
| --- | --- | --- |
| `PERSONAJE` | 0 | 201 nombres distintos; hay dos repeticiones adicionales. El nombre por sí solo no identifica de forma única una fila. |
| `CLASS` | 2 | 14 valores distintos no vacíos. |
| `SUBCLASS` | 38 | 93 valores distintos no vacíos. |
| `SPECIE` | 0 | 73 valores distintos. |
| `NIVEL` | 0 | Valores numéricos entre 1 y 15. |
| `RANGO` | 0 | 5 valores distintos; 199 celdas con fórmulas y resultado guardado, y 4 valores directos. |
| `ESTADO` | 188 | 3 valores distintos no vacíos. |
| `PROPIETARIO` | 0 | 55 valores distintos. |
| `NOTAS` | 190 | 13 celdas con contenido. |

No hay hipervínculos de celda, enlaces a libros externos, celdas combinadas ni errores de celda guardados. La hoja principal tiene 7 reglas de validación y 805 filas ocultas sin datos (206–1010), que no son personajes adicionales. No hay tablas nativas de Excel. Las hojas de catálogo no tienen vacíos en sus registros ni fórmulas.

Las fórmulas de `RANGO` dependen de `NIVEL`; sus resultados guardados no prueban un recálculo vigente. La fórmula base contiene una secuencia de comillas que requiere verificar su validez en Excel si se decide recalcular. Los valores directos de `RANGO` están en `F133`, `F162`, `F168` y `F193`; no deben sustituirse automáticamente por resultados calculados.

Los controles solicitados se apoyan en `CLASS`, `SUBCLASS`, `SPECIE`, `RANGO` y `PROPIETARIO`; el nombre se filtra por coincidencia parcial. El rango se ordena alfabéticamente en español, sin inferir jerarquía. No se han solicitado filtros adicionales de nivel o estado ni búsqueda en notas u otros campos.

## Decisiones de implementación
El usuario autorizó implementar, validar y hacer commit y push. Los detalles menores se resolvieron con estos valores conservadores:
- Selectores por los valores reales no vacíos; combinación AND. Borrar el nombre retira solo ese criterio; limpiar filtros retira todos sin cambiar la ordenación.
- Búsqueda sin distinguir mayúsculas/minúsculas, conservando diferencias de acentos.
- Rangos en orden alfabético español, sin inferir una jerarquía de juego; vacíos al final y empates por fila original.
- Vacíos visibles como raya con texto accesible “Sin dato”, sin completar la fuente. Los catálogos auxiliares no se muestran ni enriquecen los registros.
- Leer resultados almacenados de `RANGO` y conservar sus cuatro valores directos, sin recalcular.
- Cada recarga solicita el Excel vigente sin caché, sin polling; el responsable de los datos actualiza el archivo servido fuera de la web.
- Menú mínimo con enlaces internos a registro y filtros, logo provisional encima, tabla desplazable dentro de su zona en móvil.
- SheetJS CE 0.20.3 local con licencia y fuente oficial; ejecución y pruebas documentadas en `README.md`.

## Boceto de estructura
Esquema textual para conversar sobre la distribución; no es un diseño final ni una web implementada. Se incluyen los nueve campos confirmados, sin datos ficticios; las etiquetas de presentación siguen por concretar.

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo de cuervo / Nido del Cuervo + título                    │
├─────────────────────────────────────────────────────────────┤
│ Menú — contenido por definir                                │
├─────────────────────────────────────────────────────────────┤
│ Zona de filtros — controles por definir                     │
├─────────────────────────────────────────────────────────────┤
│ Tabla de personajes — ordenación por concretar              │
│ PERSONAJE | CLASS | SUBCLASS | SPECIE | NIVEL                │
│ RANGO | ESTADO | PROPIETARIO | NOTAS                         │
│ Filas procedentes del Excel, sin datos de ejemplo            │
└─────────────────────────────────────────────────────────────┘
```

## Criterios de aceptación iniciales
- Los datos mostrados corresponden fielmente al Excel, sin completar información ausente con datos inventados.
- Al abrir la web servida por HTTP se inicia la lectura del Excel desde su ruta relativa, sin selección manual; un fallo de lectura se comunica claramente.
- Ordenar o filtrar cambia la vista de la tabla sin modificar la fuente.
- Al combinar filtros, solo se muestran filas que cumplen todos los criterios activos (AND), también el texto parcial del nombre.
- Desde la primera letra del filtro de nombre, cada cambio actualiza la vista con coincidencias que contienen el texto, también en mitad o al final del nombre, sin requerir un botón. La búsqueda se limita a `PERSONAJE` y no distingue mayúsculas/minúsculas.
- Los controles básicos permiten filtrar y ordenar por clase, subclase, especie, rango y propietario.
- La vista inicial ordena los niveles numéricamente de mayor a menor, sin comparación lexicográfica.
- Los empates de nivel conservan el orden de las filas originales del Excel.
- La presentación permite distinguir encabezados y datos y consultar la tabla en móvil.
- Los controles de ordenación y filtrado pueden operarse con teclado y tienen etiquetas comprensibles; la estructura es semántica y el texto legible.
- El logo queda sobre el menú y no se añaden funciones fuera del alcance acordado.

La lectura automática, la implementación y la validación están realizadas. El arranque HTTP probado está en `README.md`. El Excel permanece idéntico al auditado; no se ha publicado hosting.
