# Nido del Cuervo — selector de tema

Estado: implementación autorizada y completada; validación local superada. Revisión del usuario pendiente, sin publicación.

## Objetivo
Permitir alternar entre aspecto claro y oscuro mediante un botón situado arriba a la derecha de la web.

## Punto de partida
La especificación 002 está integrada en `main` y publicada. La web tiene un aspecto oscuro con acentos púrpura y tonos plateados, logo de cuervo, títulos en Cinzel y controles y tabla en Roboto Flex. La consulta de personajes conserva las funciones de la especificación 001.

## Comportamiento confirmado
- Un único botón arriba a la derecha alterna entre tema claro y tema oscuro.
- Al pulsarlo, la página cambia al otro tema sin necesidad de recargarla.
- La elección manual se recuerda en próximas visitas en el mismo navegador.
- Si no existe una elección manual guardada, se utiliza la configuración clara u oscura del sistema y se siguen automáticamente sus cambios mientras la web esté abierta.
- Una elección manual guardada tiene prioridad sobre la configuración del sistema; sus cambios posteriores no sustituyen esa elección.

## Alcance y límites
- El cambio afecta a la presentación de la web y conserva la consulta, búsqueda, filtros, ordenación, nueve campos y estados de carga, error y ausencia de coincidencias.
- Cambiar de tema conserva los criterios de consulta activos y los resultados visibles.
- Se conserva la identidad actual: logo, tipografías y dirección púrpura/plateada. El tema claro usa fondo gris muy claro, texto oscuro y los mismos acentos púrpura/plateados.
- El botón debe poder utilizarse con teclado, tener un nombre accesible que comunique su acción y mostrar un foco visible en ambos temas. Muestra solo el icono del tema activo: luna con el tema oscuro y sol con el claro. El nombre accesible, visualmente oculto, indica «Tema claro» o «Tema oscuro» respectivamente.
- Ambos temas deben mantener legibilidad, contraste y adaptación a móvil; el botón seguirá accesible en pantallas pequeñas.
- Se mantienen HTML, CSS y JavaScript sin frameworks, separados y sin nuevas dependencias.
- El Excel continúa como fuente exclusivamente de lectura.
- Esta especificación no incorpora otros controles ni nuevas funciones de consulta.

## Criterios de aceptación
1. El botón aparece arriba a la derecha y permite pasar de claro a oscuro y de oscuro a claro. Con el tema oscuro activo muestra solo una luna y tiene nombre accesible «Tema claro»; con el tema claro activo muestra solo un sol y tiene nombre accesible «Tema oscuro».
2. En una visita sin elección guardada, el tema inicial coincide con la configuración del sistema.
3. Sin elección manual guardada, cambiar el tema del sistema con la web abierta actualiza automáticamente el tema visible, tanto de claro a oscuro como de oscuro a claro.
4. Tras una elección manual, una recarga o una visita posterior en el mismo navegador conserva ese tema.
5. Una preferencia manual guardada se aplica aunque el sistema tenga seleccionado el otro tema; cambiar la configuración del sistema con la web abierta no altera la elección manual.
6. Alternar el tema conserva búsqueda, filtros, ordenación y resultados.
7. El botón se puede activar con teclado y su acción es comprensible mediante su nombre accesible.
8. El tema claro presenta fondo gris muy claro, texto oscuro y los mismos acentos púrpura/plateados. Ambos temas presentan texto y controles legibles, foco visible y una disposición operable en móvil.
9. El Excel y los datos mostrados permanecen intactos.

## Clarificación resuelta
- Tema claro confirmado: fondo gris muy claro, texto oscuro y los mismos acentos púrpura/plateados.
- Presentación del botón confirmada: solo icono del tema activo (sol en claro, luna en oscuro); «Tema claro» o «Tema oscuro» se conserva como nombre accesible visualmente oculto, indicando el tema de destino. Esta decisión del usuario durante la revisión sustituye el texto visible aprobado inicialmente.
- La implementación usa la paleta de trabajo del plan, verificada por contraste, e iconos SVG de sol y luna. La dirección aprobada se conserva; revisión visual del usuario pendiente.

## Rama y siguiente etapa
Rama local y de GitHub: `codex/003-selector-tema`, creada desde `main` antes de escribir estos documentos. La clarificación está resuelta y el plan autorizado está en `specs/003-selector-tema/plan.md`. Las tareas autorizadas están en `specs/003-selector-tema/tasks.md`. Implementación y validación local completadas; revisión del usuario pendiente. Evidencia y límites en `specs/003-selector-tema/tasks.md`.

Presentación final confirmada: icono discreto de 16 px, sin borde permanente, fondo marcado ni contenedor decorativo; área invisible de interacción de 44 × 44 px. Hover mediante cambio de color y foco visible al teclado.

Entrega 003 autorizada: el usuario aprobó el resultado final y autorizó commit, push de `codex/003-selector-tema` y despliegue al Site privado existente. No autorizó integración en `main`. Esta decisión supera las referencias anteriores a revisión pendiente y prohibición de publicación. Despliegue en preparación; todavía no se afirma éxito.
