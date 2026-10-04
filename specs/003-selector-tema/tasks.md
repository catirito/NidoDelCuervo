# Nido del Cuervo — tareas del selector de tema

Estado: T01–T07 completadas tras autorización de implementación y validación local. Revisión del usuario pendiente.

## Alcance y orden
Este desglose desarrolla `specs/003-selector-tema/plan.md` y conserva los criterios de `specs/003-selector-tema/spec.md`. Implementación autorizada y ejecutada en el orden indicado, en `codex/003-selector-tema` y la carpeta principal. Los pasos de código pueden necesitarse entre sí antes de una revisión completa; las comprobaciones de cada paso no sustituyen la validación final.

### T01 — Definir los colores de ambos temas
- [x] En `styles.css`, conservar las variables existentes y definir sus valores claros y oscuros mediante `data-theme` en la raíz, con `color-scheme` correspondiente y respaldo según el sistema cuando no haya atributo.
- [x] Separar el texto sobre botones de acento del fondo de página y aplicarlo a los botones afectados. Mantener gris muy claro, texto oscuro y dirección púrpura/plateada en el tema claro; usar la paleta del plan como punto de partida ajustable.

Verificación: aplicar ambos temas durante la revisión local y comprobar fondos, superficies, controles nativos, tabla, texto secundario, vacíos, hover y foco; conservar fuentes, logo y radios. No duplicar estilos de componentes para cada tema.

### T02 — Resolver el tema inicial sin depender del registro
Depende de T01.
- [x] Crear `theme.js` externo con funciones pequeñas para leer una preferencia válida `light` o `dark`, consultar el sistema y aplicar el tema a la raíz y a `theme-color`.
- [x] Cargarlo desde la cabecera de `index.html` antes del contenido; mantener todo el código fuera del HTML. Aplicar la preferencia guardada o, si falta o es inválida, el tema del sistema.
- [x] Proteger el acceso al almacenamiento para que un fallo no impida cargar la página.

Verificación: inicio claro y oscuro sin preferencia; inicio con cada preferencia válida frente al sistema opuesto; valor inválido y lectura bloqueada. Comprobar selección antes de mostrar contenido, sin destello perceptible del otro tema y sin errores que afecten a la consulta. Seguir al sistema no escribe una preferencia manual.

### T03 — Incorporar el botón y su presentación adaptable
Depende de T01 y T02.
- [x] Añadir a `.masthead` un botón nativo `type="button"`, arriba a la derecha, con iconos sencillos de sol/luna y texto visualmente oculto que proporciona el nombre accesible. Ocultar los iconos a tecnologías de asistencia.
- [x] Conectar el botón cuando el DOM esté disponible y actualizar su acción con el tema aplicado: oscuro → luna y nombre accesible «Tema claro»; claro → sol y nombre accesible «Tema oscuro».
- [x] Definir en `styles.css` distribución, estados y foco visible; mantener al menos 44 px de alto y evitar solapamientos en móvil.

Verificación: el texto accesible comunica el tema de destino, anuncia cambiar al tema opuesto al representado por el icono y conserva el foco al actualizarse. Revisar posición y ausencia de desbordamiento a 1440, 390 y 320 px. Mantener la cabecera compacta y el acceso directo a la consulta.

### T04 — Alternar, persistir y seguir el sistema
Depende de T02 y T03.
- [x] Alternar el tema visible al activar el botón, registrar elección manual en memoria y guardar únicamente `light` o `dark` con una clave específica del proyecto en `localStorage`.
- [x] Observar cambios de `prefers-color-scheme` mediante `matchMedia`: aplicarlos solo mientras no exista elección manual y actualizar también el botón.
- [x] Conservar prioridad manual durante la sesión aunque falle la escritura; tolerar almacenamiento bloqueado. No añadir un control para restablecer el modo automático.

Verificación: cambios del sistema en ambas direcciones con la web abierta sin preferencia; ausencia de persistencia al seguir al sistema; elección manual en ambas direcciones, recarga y visita posterior; sistema opuesto sin sustituir la elección. Con escritura bloqueada, el botón sigue funcionando y la elección manda durante la sesión; documentar que persistir entre visitas requiere almacenamiento disponible.

### T05 — Validar accesibilidad y acabado visual
Depende de T01–T04.
- [x] Revisar ambos temas en Chrome a 1440, 390 y 320 px, incluidos logo, textos, filtros, tabla, estados, hover y foco.
- [x] Medir contraste en combinaciones reales: al menos 4,5:1 para texto normal y 3:1 para límites y estados esenciales de controles. Ajustar los colores propuestos si hace falta sin cambiar la dirección aprobada.
- [x] Comprobar Tab, Enter y Espacio, nombre accesible, foco conservado y movimiento reducido.

Verificación: botón legible y operable sin solapamientos, foco perceptible en ambos temas y tabla desplazable sin desbordamiento de página. Registrar medidas y vistas comprobadas; no afirmar pruebas de lectores de pantalla o navegadores no realizadas.

### T06 — Verificar conservación de consulta y datos
Depende de T04 y T05.
- [x] Con el servidor establecido `python3 -m http.server 8765 --bind 127.0.0.1`, comprobar que alternar mantiene búsqueda, filtros AND, ordenación y resultados, sin recargar Excel ni reconstruir la consulta por el cambio de tema.
- [x] Revisar carga, ausencia de coincidencias, error y recuperación en ambos temas; mantener el selector operativo con independencia del registro.
- [x] Ejecutar `node tests/records.test.mjs` y comprobar que el Excel conserva su hash verificado.

Verificación: nueve campos y comportamiento previo conservados; sin errores JavaScript del selector, modificación de `app.js`/`records.js` innecesaria ni cambios en Excel, biblioteca, fuentes o logo. Registrar resultados y cualquier limitación; no crear pruebas que solo reproduzcan estilos.

### T07 — Documentar y preparar la revisión local
Depende de T05 y T06.
- [x] Actualizar `README.md`, el estado de los documentos 003 y `Memories.md` con comportamiento realizado, evidencia de validación y limitaciones.
- [x] Marcar tareas completadas únicamente con evidencia y presentar la web local para revisión del usuario.

Verificación: documentación coherente con el resultado, diff limitado al selector y archivos previstos, rama `codex/003-selector-tema` y Excel intacto. Commits, push, integración y despliegue requieren su correspondiente autorización; no forman parte de esta etapa.

## Validación local 003
Implementación comprobada el 3 de octubre de 2026 con Chrome en modo headless y revisión de capturas de página a 1440, 390 y 320 px en ambos temas, sin solapamientos ni desbordamiento de página. Se verificaron selección inicial y primer frame con preferencia guardada, seguimiento del sistema en ambas direcciones sin guardar elección, iconos y nombre accesible, prioridad manual, recarga y nueva visita para ambos temas, valor inválido y almacenamiento bloqueado. Tab, Enter y Espacio, foco conservado y visible, movimiento reducido y respaldo CSS sin JavaScript comprobados.

Alternar conserva búsqueda, filtro de clase, ordenación y filas, sin nueva solicitud del Excel. Estados de carga, vacío, error HTTP 503 y recuperación comprobados con el selector operativo. Sin errores JavaScript de página. `node tests/records.test.mjs` pasa: 203 registros, nueve campos, fórmulas guardadas, orden estable, búsqueda/filtros AND y hash del Excel intacto (`8ca0c7869c145d556ec22d40554c55fe5b3236a86452d65668c7b43a0bce528f`).

Contrastes medidos de las combinaciones de texto activas: mínimo 5,24:1 en claro y 4,64:1 en oscuro; bordes esenciales de controles sobre superficie: 6,58:1 y 5,47:1 respectivamente. El foco supera 3:1. Los controles deshabilitados conservan la atenuación existente.

Límites: sistema emulado mediante el navegador, sin prueba de cambio real del sistema operativo ni lector de pantalla real o todos los navegadores. El primer frame comprobado no sustituye una auditoría de todas las condiciones de red. Si el navegador bloquea almacenamiento, la elección manual se conserva durante la sesión pero no puede recordarse entre visitas. Revisión del usuario pendiente en http://127.0.0.1:8765; sin commits, push, integración ni despliegue.

## Ajuste durante la revisión del usuario
Decisión final: botón solo con icono del tema activo (luna en oscuro, sol en claro). Sustituye el texto visible y el icono de destino anteriores; el nombre accesible sigue indicando la acción opuesta mediante texto visualmente oculto. Comprobación proporcional en Chrome headless: ambos iconos y nombres accesibles, texto oculto, Enter/Espacio y foco conservado/visible, área de interacción de al menos 44 × 44 px y ausencia de desbordamiento a 1440, 390 y 320 px. No se modificó la lógica de sistema, almacenamiento ni consulta; no se repitieron pruebas no afectadas.

## Ajuste minimalista confirmado
Botón sin borde permanente ni fondo, icono de 16 px y área invisible de 44 × 44 px. Luna para oscuro activo, sol para claro activo, nombre accesible para cambiar al opuesto. Chrome comprobó ambos temas a 1440, 390 y 320 px: fondo transparente incluso en hover, borde de 0 px, icono de 16 px, área de interacción, ausencia de desbordamiento, nombre accesible, Enter/Espacio y foco visible/conservado. Hover cambia únicamente el color del icono. Sin cambios en lógica, persistencia ni consulta; no se repitieron verificaciones no afectadas. Revisión del usuario pendiente; sin commit ni publicación.

Entrega 003 autorizada: el usuario aprobó el resultado final y autorizó commit, push de `codex/003-selector-tema` y despliegue al Site privado existente. No autorizó integración en `main`. Esta decisión supera las referencias anteriores a revisión pendiente y prohibición de publicación. Entrega confirmada el 3 de octubre de 2026: rama publicada con commit `ea3048995809c43b9afb7819adc8416c714bc3ef`, sin integrar en `main`. Sites confirmó `succeeded` en https://nido-del-cuervo.catirito.chatgpt.site, conservando acceso privado. Despliegue `appgdep_6ac1587b638c8191b742aaa414717f92`, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_17ea56251e288191808f785ce13a1b18`, fuente de Sites `1d3026eda0b04ca25bec80831800b3d773a0b9dd`. Excel intacto. Las notas previas de revisión pendiente describen etapas ya superadas.
