# Nido del Cuervo — plan del selector de tema

Estado: planificación e implementación autorizadas; tareas completadas y validación local superada. Revisión del usuario pendiente.

## Resultado previsto
Añadir un botón arriba a la derecha que alterne los temas claro y oscuro sin recargar ni modificar la consulta. El tema claro tendrá fondo gris muy claro, texto oscuro y acentos púrpura/plateados. Se conserva el tema oscuro, la identidad, las tipografías, el logo y la composición compacta existentes.

## Punto de partida inspeccionado
- `index.html` contiene una cabecera `.masthead` con `.brand`, carga `styles.css` y el módulo `app.js`, y declara `theme-color` oscuro.
- `styles.css` concentra los colores en ocho variables de `:root`, con `color-scheme: dark`; controles, tabla, estados y foco ya utilizan esas variables. Los botones de acento usan actualmente `--paper` como texto: esta relación debe separarse para el tema claro.
- `app.js` gestiona carga, búsqueda, filtros y ordenación; no contiene preferencias de tema. `records.js` contiene las operaciones de datos.
- `README.md` establece el servidor local y la prueba de datos. No se necesitan frameworks ni dependencias nuevas.

## Composición y presentación
La orientación de `.agents/skills/frontend-skill/SKILL.md` se adapta a esta superficie de consulta: jerarquía tranquila, pocos colores y controles claros. La cabecera conserva marca y logo y coloca el botón a la derecha en el flujo del documento. En móvil se permite ajustar la distribución de la cabecera para evitar solapamientos, manteniendo el botón alineado a la derecha y accesible. Sin nuevas secciones ni animaciones decorativas.

El botón nativo tendrá `type="button"`, texto visualmente oculto que proporciona el nombre accesible y un icono sencillo de sol o luna, oculto a tecnologías de asistencia para evitar duplicar el texto. Con tema oscuro activo muestra solo luna y nombre accesible «Tema claro»; con tema claro activo muestra solo sol y nombre accesible «Tema oscuro». Icono y nombre accesible se actualizan también al cambiar automáticamente el tema del sistema. Mantener foco visible y un área de interacción de al menos 44 px de alto.

## Variables y paleta de trabajo
Mantener los nombres actuales para evitar una refactorización ajena al alcance. Cambiar los valores según un atributo `data-theme` en el elemento raíz y ajustar `color-scheme` para controles nativos. Añadir una variable independiente para texto sobre botones de acento; no reutilizar el fondo de página para ese propósito.

Valores de partida para implementación y comprobación de contraste, sin presentarlos como colores exactos aprobados por el usuario:

| Uso / variable | Oscuro existente | Claro propuesto |
| --- | --- | --- |
| Fondo / `--paper` | `#16161D` | `#F3F4F7` |
| Texto / `--ink` | `#E6E7ED` | `#20212B` |
| Texto secundario / `--muted` | `#BBC0CE` | `#555967` |
| Bordes / `--line` | `#5E6270` | `#7A7E8C` |
| Acento / `--accent` | `#9590F2` | `#5D51A6` |
| Superficie secundaria / `--soft` | `#30313B` | `#E4E5EE` |
| Superficie principal / `--white` | `#24252F` | `#FFFFFF` |
| Foco / `--focus` | `#C4B9FF` | `#51448F` |
| Texto sobre acento / nueva variable | `#16161D` | `#FFFFFF` |

La misma identidad púrpura/plateada se adapta a fondos claros con un púrpura más oscuro para legibilidad. Verificar texto normal a 4,5:1 y límites y estados esenciales de controles a 3:1, incluidos hover y foco; ajustar estos valores si las combinaciones reales lo requieren. Conservar radios, fuentes locales y logo sin regenerar assets.

## Selección y persistencia
Separar la preferencia manual del tema visible: seguir al sistema no debe guardar una elección manual.

| Situación | Comportamiento |
| --- | --- |
| Inicio con preferencia válida guardada | Aplicar esa preferencia, aunque difiera del sistema. |
| Inicio sin preferencia válida | Aplicar el tema indicado por `prefers-color-scheme`. |
| Cambio del sistema sin elección manual | Actualizar el tema visible y la acción del botón inmediatamente. |
| Pulsación del botón | Alternar el tema visible, adoptar elección manual y guardarla. |
| Cambio del sistema con elección manual | Conservar el tema elegido. |
| Recarga o visita posterior | Recuperar la elección manual del mismo navegador y origen. |

Usar `matchMedia` para consultar y observar el sistema y `localStorage` con una clave específica del proyecto para guardar únicamente `light` o `dark`. Un valor ausente o inválido se trata como ausencia de preferencia. Proteger lectura y escritura frente a almacenamiento bloqueado: la consulta y el botón deben continuar funcionando; una elección manual permanece durante la sesión aunque no pueda persistirse. La persistencia entre visitas requiere almacenamiento disponible. No añadir un control para volver al modo automático, fuera del alcance confirmado.

## Cambios previstos por archivo
- `index.html`: incorporar el botón a `.masthead` y cargar un archivo externo `theme.js` en la cabecera, antes del contenido. Mantener estilos y lógica fuera del HTML.
- `theme.js` (nuevo): encapsular lectura de preferencia, selección inicial, aplicación de tema, seguimiento del sistema y alternancia manual en funciones pequeñas. Aplicar el atributo raíz al cargar el script y conectar el botón cuando el DOM esté disponible. Esto permite seleccionar el tema antes de mostrar el contenido sin depender de la carga del Excel. Actualizar también `theme-color` según el tema activo.
- `styles.css`: definir ambas paletas, el color de texto sobre acento y los estilos del botón y su distribución adaptable. Usar la preferencia del sistema como respaldo CSS cuando no haya atributo manual; el atributo aplicado por JavaScript tiene prioridad. Respetar la regla existente de movimiento reducido.
- `app.js` y `records.js`: conservar sus responsabilidades y comportamiento; cambiar el tema no llama a carga ni renderizado de registros, ni reinicia el formulario o la ordenación.
- Documentación: tras la implementación autorizada, reflejar el selector y la evidencia de validación en `README.md` y los documentos de la especificación.

Mantener el selector independiente de los errores de carga del registro. No modificar Excel, biblioteca, fuentes ni logo; no añadir comentarios al código.

## Validación prevista
Comprobaciones realizadas tras implementar con autorización; evidencia y límites en `specs/003-selector-tema/tasks.md`. Se conserva aquí el alcance de validación previsto.

- Usar el servidor existente: `python3 -m http.server 8765 --bind 127.0.0.1` y abrir `http://127.0.0.1:8765`.
- En Chrome, comprobar inicio claro y oscuro sin preferencia, cambios de sistema con la web abierta en ambas direcciones y ausencia de escritura manual al seguir al sistema.
- Elegir cada tema manualmente, comprobar recarga y próxima visita, y cambiar el sistema para verificar la prioridad manual. Revisar valor inválido y almacenamiento bloqueado sin errores que impidan consultar.
- Comprobar icono del tema activo y nombre accesible del destino, clic, Tab, Enter y Espacio, foco y nombre accesible; mantener el foco al alternar.
- Revisar ambos temas a 1440, 390 y 320 px: cabecera sin solapamientos, controles y estados legibles, tabla desplazable sin desbordamiento de página. Comprobar contraste en las combinaciones reales y la selección inicial sin un destello perceptible del tema opuesto.
- Alternar con búsqueda, filtros AND y ordenación activos y verificar que criterios y resultados se conservan. Revisar carga, ausencia de coincidencias, error y recuperación en ambos temas y selector disponible durante esos estados.
- Ejecutar la prueba existente `node tests/records.test.mjs`, que incluye la comprobación del Excel, como regresión de datos. No crear pruebas que solo reproduzcan estilos ni afirmar compatibilidad con navegadores o lectores de pantalla no comprobados.

## Siguiente etapa y límites
Plan revisado por el usuario y tareas autorizadas y elaboradas en `specs/003-selector-tema/tasks.md`. Implementación autorizada y completada, con evidencia de validación y límites en `specs/003-selector-tema/tasks.md`. Pendiente de revisión del usuario; commits, push, integración en `main` y publicación siguen sin autorización. El trabajo sigue en `codex/003-selector-tema`, directamente en la carpeta principal.

Presentación final confirmada: icono discreto de 16 px, sin borde permanente, fondo marcado ni contenedor decorativo; área invisible de interacción de 44 × 44 px. Hover mediante cambio de color y foco visible al teclado.

Entrega 003 autorizada: el usuario aprobó el resultado final y autorizó commit, push de `codex/003-selector-tema` y despliegue al Site privado existente. No autorizó integración en `main`. Esta decisión supera las referencias anteriores a revisión pendiente y prohibición de publicación. Entrega confirmada el 3 de octubre de 2026: rama publicada con commit `ea3048995809c43b9afb7819adc8416c714bc3ef`, sin integrar en `main`. Sites confirmó `succeeded` en https://nido-del-cuervo.catirito.chatgpt.site, conservando acceso privado. Despliegue `appgdep_6ac1587b638c8191b742aaa414717f92`, versión `appgprj_6abe80aea354819180edc5e0c3f12bab~appgver_17ea56251e288191808f785ce13a1b18`, fuente de Sites `1d3026eda0b04ca25bec80831800b3d773a0b9dd`. Excel intacto. Las notas previas de revisión pendiente describen etapas ya superadas.
