# Tareas — distribución de la cabecera del listado

Estado: desglose autorizado. Implementación autorizada, completada y revisada en local. Rama local/GitHub: `codex/008-cabecera-listado`.

## 1. Estructura y presentación
- [x] Mover p#result-status después de p#table-help y antes de .table-scroll, conservando id y atributos accesibles.
- [x] Mantener .results-bar con título y acciones, sin duplicar contador ni cambiar mensajes de edición/exportación.
- [x] Aplicar estilos discretos a #result-status y retirar reglas del contador vinculadas a .results-bar p, incluida alineación/ancho móviles.
- [x] Conservar la distribución adaptable de los botones y los estilos de foco; no modificar JavaScript ni datos.

## 2. Revisión local
- [x] Regenerar la salida con el build existente si se requiere para el servidor local.
- [x] Revisar título, botones y contador en 1440, 390 y 320 px, con temas claro y oscuro; sin desbordamiento de la cabecera.
- [x] Comprobar actualizaciones del contador en cambio de página, filtros/búsqueda y cero resultados; conservar las actualizaciones existentes de carga/error sin modificar app.js.
- [x] Verificar contador único, role/aria conservados y foco por teclado de acciones.
- [x] Comprobar diff sin cambios ajenos, registrar resultados y límites en este documento, actualizar Memories.md y mostrar la vista local.

## Próxima etapa
Revisión del usuario; commit, push de implementación, merge y publicación pendientes de autorización.

## Evidencia de revisión local
- Modificados únicamente index.html y styles.css como código de producto. Un único result-status permanece después de table-help y antes de table-scroll, fuera de results-bar; role=status, aria-live=polite y aria-atomic=true conservados.
- Build existente ejecutado con `/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build-cloudflare.mjs`; git diff --check pasa.
- Navegador integrado en http://127.0.0.1:8788: revisión visual y límites de elementos a 1440/390/320 px, en temas oscuro/claro; contador alineado a la izquierda, sin desbordamiento de contador/botones. Capturas de ambos temas a 320 px revisadas durante la sesión.
- Cambio a página 2 muestra 51–100 de 203; búsqueda sin coincidencias muestra 0–0 de 0 coincidencias · 203 personajes; limpiar restaura 1–50 de 203. Tab desde Exportar Excel lleva a Editar con contorno sólido visible.
- Sin escrituras de datos, pruebas nuevas o cambios de JavaScript/API. No se forzaron errores ni se capturó el estado transitorio de carga: conservan elemento y referencias previos. No se ha usado un lector de pantalla real ni verificado todos los navegadores.
- Tema oscuro y tamaño habitual del navegador restaurados; vista local abierta para revisión. Sin commit/push de implementación, merge ni publicación de 008.

## Entrega aprobada
El usuario aprueba el resultado local y autoriza integrarlo en main. Crear commit y merge locales; publicación expresamente aplazada, sin push ni despliegue en esta entrega.
