# Plan — distribución de la cabecera del listado

Estado: autorizado y preparado. Implementación autorizada y completada; evidencia y límites en tasks.md. Rama: `codex/008-cabecera-listado`.

## Dirección visual
Conservar la identidad púrpura/plateada, tipografía y botones existentes; mejorar la jerarquía mediante posición y separación. La cabecera presenta título y acciones; la ayuda y el contador orientan la lectura de la tabla. Se conservan hover y foco existentes, sin añadir animaciones ni elementos decorativos para este cambio delimitado. Orientación consultada: `.agents/skills/frontend-skill/SKILL.md`, adaptada a HTML/CSS/JavaScript sin frameworks.

## HTML
Mover el único p#result-status fuera de .results-bar, después de p#table-help y justo antes de .table-scroll. Conservar id y atributos accesibles, sin duplicarlo. Mantener los mensajes de exportación, borradores y recuperación en sus posiciones actuales. .results-bar contiene únicamente título y acciones existentes, incluida «Actualizar y revisar» cuando se muestre.

## CSS
Trasladar las reglas del contador desde .results-bar p a #result-status: tamaño de 11 px, color var(--muted), alineación izquierda y separación discreta con tabla/ayuda. Retirar su antigua regla móvil de alineación derecha y ancho máximo 210 px. Darle altura de línea legible y permitir envoltura natural. Mantener flex de título/acciones y la adaptación existente de botones. No modificar tipografía o estilos globales de otros párrafos.

## JavaScript
No cambiar app.js: ya referencia el contador por #result-status, por lo que mover el elemento conserva sus actualizaciones. No cambiar carga, consulta, edición ni exportación.

## Verificación proporcional
Revisar en el servidor local existente con D1 aislada: escritorio 1440 px y móvil 390/320 px, claro/oscuro. Observar alineación y separación, contador con consulta normal y búsqueda sin resultados, cambio de página y foco de botones. Comprobar que el contador es único y conserva los atributos accesibles. La carga y el error conservan las mismas referencias JavaScript; comprobar su presentación cuando sea posible mediante interceptación local, sin tocar producción.

No añadir pruebas automáticas nuevas para esta reubicación de HTML/CSS. Usar comprobación del diff y revisión de navegador; registrar evidencia y límites en tasks.md. Si es necesario regenerar la vista local, usar scripts/build-cloudflare.mjs ya establecido. No ejecutar pruebas de escritura para un cambio visual.

## Entrega
Actualizar Memories.md y mostrar resultado local para revisión. Commit, push de implementación, merge y publicación requieren autorización de entrega; la rama vacía ya existe en GitHub por las reglas del proyecto.

## Entrega aprobada
El usuario aprueba el resultado local y autoriza integrarlo en main. Crear commit y merge locales; publicación expresamente aplazada, sin push ni despliegue en esta entrega.
