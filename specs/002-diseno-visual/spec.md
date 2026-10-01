# Nido del Cuervo — mejora del diseño visual

Estado: implementación y validación local completadas. Revisión del usuario pendiente antes de push; no se ha actualizado el Site.

## Objetivo confirmado
Mejorar el diseño y el aspecto de la web existente. Repetir el proceso paso a paso: especificación → clarificación → planificación → tareas → implementación → validación.

## Dirección visual confirmada
- Estética de fantasía medieval.
- Aspecto oscuro inspirado en [D&D Beyond](https://www.dndbeyond.com/en), referencia inicial indicada por el usuario; adaptar el acento a tonos dorados.
- Presentación más moderna y suave, con esquinas redondeadas y menos sensación de cuadrícula rígida, conservando la temática medieval.
- Empezar por cambiar la temática de colores. El usuario solicitó una propuesta de colores y confirmó sustituir los acentos rojos por dorados.
- La referencia es visual; los tonos dorados adaptan la propuesta a Nido del Cuervo. No se han comprobado valores cromáticos oficiales.

## Punto de partida verificado
La web es una superficie de consulta de personajes: cabecera con logo de cuervo, menú, búsqueda, cinco filtros y tabla de nueve campos. El diseño actual usa fondo claro de papel, tinta oscura, acento verde, tipografía Georgia y Arial y tabla desplazable en móvil. La funcionalidad existente está documentada en `specs/001-registro-personajes/spec.md`.

## Límites del proyecto
- HTML, CSS y JavaScript sin frameworks, en archivos separados y siguiendo `AGENTS.md`.
- Excel como única fuente de datos y exclusivamente en lectura.
- Consultar la Frontend Skill del proyecto para composición, jerarquía, tipografía y claridad del espacio de consulta.
- Definir los requisitos visuales antes de elaborar el plan y las tareas; implementar solo en la etapa autorizada.

## Reorganización confirmada
- Retirar el total de personajes situado arriba a la derecha (`registry-count`), sin trasladarlo a otro lugar.
- Retirar el menú de navegación actual: los enlaces a registro y filtros no aportan utilidad en esta página.
- Acercar la consulta de la tabla al inicio de la página con una composición más directa y compacta.
- El usuario limita por ahora la reorganización a esos cambios.

## Alcance conservado
La búsqueda por nombre, los cinco filtros, la ordenación, los nueve campos y los estados de carga, error y ausencia de coincidencias mantienen su comportamiento. La petición de mostrar directamente la tabla no implica eliminar los controles de consulta. El estado de resultados junto a la tabla es distinto del total de cabecera solicitado para retirar y se conserva por utilidad y accesibilidad.

Se mantienen el nombre, el logo de cuervo y las familias tipográficas actuales como base. Ajustar su contraste y presentación para el tema oscuro forma parte del tratamiento visual. No se añaden imágenes, nuevas fuentes, funciones ni animaciones decorativas en esta especificación.

## Criterios de aceptación
- Tema oscuro con acentos dorados, texto legible y contraste suficiente sobre los fondos usados.
- Esquinas redondeadas, espaciado equilibrado y menor sensación de cuadrícula rígida, con un acabado moderno que conserve la temática medieval.
- Ausencia del menú actual y del contador de cabecera situado arriba a la derecha.
- Cabecera compacta y acceso directo a controles y tabla, sin nuevas secciones intermedias.
- Conservación de los nueve campos, búsqueda, filtros AND, ordenaciones y estados accesibles de la especificación 001, salvo las retiradas expresamente definidas aquí.
- Interacción con teclado, foco visible y adaptación a móvil; desplazamiento horizontal limitado a la tabla cuando sea necesario.
- Excel original intacto y lectura exclusivamente de consulta.

## Detalles para planificación
Los colores propuestos son la base de trabajo; sus valores exactos pueden ajustarse para cumplir contraste. Radios, espaciado y tratamiento de superficies se concretarán en el plan dentro de la dirección aprobada. No quedan otras reorganizaciones solicitadas por ahora.

## Documentos asociados
Plan y tareas disponibles en `specs/002-diseno-visual/plan.md` y `specs/002-diseno-visual/tasks.md`.

## Paleta propuesta, valores concretos pendientes de aprobación
Propuesta solicitada por el usuario: carbón y pizarra como base, blanco hueso para texto y dorado como único acento cromático. Inspiración general en D&D Beyond; no se presenta como paleta oficial ni como valores extraídos de su guía de marca.

| Uso | Color |
| --- | --- |
| Fondo | `#16181D` |
| Superficie | `#22252C` |
| Texto principal | `#F2EEE5` |
| Texto secundario | `#BBB7AF` |
| Bordes | `#555963` |
| Acento: oro envejecido | `#C6A15B` |
| Enlaces y foco: oro claro | `#E7C784` |
| Texto sobre acento | `#16181D` |

El dorado envejecido se propone para botones con texto carbón; enlaces y foco usarán oro claro. El usuario ha confirmado la dirección dorada; los valores exactos son una propuesta. Los separadores discretos son decorativos: los límites y estados esenciales de controles deben resultar perceptibles.

## Tratamiento visual confirmado
- Suavizar la apariencia cuadriculada mediante esquinas redondeadas, espaciado equilibrado y separación clara entre áreas.
- Dar un aspecto más moderno sin perder la identidad de fantasía medieval.
- Mantener legibles filtros y tabla en escritorio y móvil.
- Radios, sombras discretas y espaciado se concretarán en planificación; logo y tipografías se conservan como base. Todavía no se modifica la web.

## Muestra para clarificación
Se prepara una muestra de paleta y superficie de consulta con tres personajes reales del Excel. Es una vista parcial para decidir colores y tratamiento de bordes; no sustituye los nueve campos de la web ni constituye implementación. Los colores y radios pueden explorarse en la muestra antes de aprobar el diseño.

## Clarificación
El usuario autoriza avanzar al siguiente paso después de definir la dirección visual y solicita trabajar en una rama nueva de GitHub. La rama `codex/002-diseno-visual` está creada localmente y en GitHub. El usuario concretó retirar el menú y el total de cabecera, y dar acceso más directo a la tabla; no solicita otras reorganizaciones por ahora. Los cambios actuales son de documentación, no de implementación ni publicación del rediseño.
