# Nido del Cuervo — edición de niveles

Estado: planificación revisada y tareas autorizadas. Implementación y commit local autorizados y realizados; recursos remotos y publicación aplazados. Rama local y GitHub: `codex/004-edicion-niveles`.

## Objetivo y punto de partida
Permitir editar niveles de varios personajes desde la web y guardar juntos sus cambios. La ampliación a otros campos se pospone por decisión del usuario a las especificaciones 005 y 006. La web pública actual consulta una copia del Excel, tiene 203 registros y nueve campos; los nombres no son únicos. Se conserva el frontend HTML/CSS/JavaScript, consulta, temas y adaptación móvil. No se integra en `main`.

## Decisiones confirmadas
- Usar Cloudflare D1 y una API de servidor, dentro del plan gratuito y con tráfico mínimo. El navegador no accede directamente a D1 ni tiene credenciales de administración.
- Consulta y escritura sin contraseña ni autenticación. El usuario revoca la propuesta anterior de clave compartida y sesiones. «Editar» es un modo de interfaz, no un control de acceso: la API pública permite escrituras a quien pueda llamarla.
- «Editar» muestra menos/más junto al nivel. Cada pulsación cambia el borrador en un nivel, entre 1 y 20. Se puede cambiar varias veces el mismo personaje y editar varios personajes antes de guardar.
- «Guardar» envía una sola petición con los personajes modificados, únicamente los campos cambiados y la versión leída. No envía los registros intactos; revertir un campo a su valor inicial lo retira del conjunto de cambios. No hay escritura por pulsación.
- En 004 se edita únicamente `NIVEL`; `RANGO` se calcula automáticamente. Los demás campos se importan y consultan, pero no se modifican desde la web. No crear/eliminar personajes ni editar propietario.
- Conservar el Excel original como histórico de solo lectura y sin descarga pública. Importar los ocho campos distintos de rango tal como están; calcular y corregir `RANGO` según el nivel. D1 será la fuente activa después de la migración. No reimportar en cada publicación.
- Si alguien cambia un personaje desde su lectura, avisar para actualizar antes de guardar y no sobrescribirlo silenciosamente.
- No ejecutar tests en producción.

## Regla de rango
| Nivel | Rango |
| --- | --- |
| 1–2 | Corvato |
| 3–4 | Cuervo blanco |
| 5–8 | Cuervo gris |
| 9–12 | Cuervo negro |
| 13–16 | Cuervo de ébano |
| 17–20 | Cuervo de ónice |

Se aplica en ambos sentidos y desde la importación inicial. Las rayas de la imagen mantienen el rango del umbral anterior. No se añade edición de partidas. La inspección local encontró 203 niveles enteros entre 1 y 15 y tres rangos incompatibles con el nivel, ignorando mayúsculas; se corregirán solo en D1. Los rangos se escriben según esta tabla; los demás campos y vacíos permanecen intactos.

## Comportamiento requerido
Cada personaje tiene un UUID v4 estable, generado una sola vez al importar y almacenado como texto en D1, independiente de nombre y posición visible. No regenerarlo al guardar, cargar o publicar. La importación conserva el orden de origen para los desempates. Entrar en edición no cambia datos. Menos/más modifica el borrador local. El rango correspondiente se muestra como pendiente cuando cambia el nivel, no como guardado.

Mientras se guarda, impedir envíos repetidos y nuevas modificaciones al lote en curso. Tras éxito, usar la respuesta del servidor, actualizar versiones, retirar el estado pendiente y volver a consulta. Conservar filtros, búsqueda y tema; reaplicar ordenación con foco predecible. Un error mantiene los cambios pendientes y permite recuperarse sin anunciar éxito. No reintentar escrituras automáticamente.

Validar en servidor identificadores, duplicados, niveles enteros 1–20, campo permitido y versiones. El nuevo nivel puede diferir en varios puntos del original; el paso de uno se aplica solo a los controles. Nivel y rango se guardan coherentes. No hay endpoints de sesiones ni rango manual. En esta entrega el lote solo admite cambios de nivel; se rechazan los demás campos de escritura.

## Criterios de aceptación
1. Cargar personajes desde D1, conservando ocho campos y usando el rango derivado del nivel.
2. Entrar en edición sin clave; habilitar menos/más operables con teclado y móvil.
3. Cambiar localmente varios personajes, incluido un salto de cinco niveles mediante pulsaciones, sin peticiones de escritura intermedias.
4. Guardar en una sola petición únicamente los registros y campos cuyo valor final difiere del inicial.
5. Rechazar valores no enteros, fuera de 1–20, identidades inválidas y modificaciones de campos no autorizados como propietario o rango manual.
6. Guardar rango y nivel coherentes; observarlos en una visita posterior sin publicar de nuevo.
7. Detectar cambios concurrentes y no pisarlos; informar errores sin falso éxito.
8. Mantener búsqueda, filtros, ordenación y temas.
9. Conservar Excel intacto, ausente de archivos públicos, y no sobrescribir ediciones en futuros despliegues.
10. Mantener plan gratuito y validar fuera de producción.

## Propuestas técnicas y pendientes
- Guardado atómico confirmado: guardar el lote completo o ninguno ante validación fallida o conflicto; no aceptar guardados parciales.
- La ubicación de una copia adicional privada del Excel queda pendiente; el original local se conserva. Ese histórico recupera el estado inicial, no las ediciones posteriores.
- El usuario pide un sketch de la interfaz antes de implementar. El usuario aprobó el diseño compacto y su implementación local.
- Sesiones, claves y guardado por incremento descritos en revisiones anteriores quedan sustituidos por el guardado por lotes sin autenticación. La ampliación a otros campos se conserva para entregas futuras.

## Funcionalidades pospuestas
- `specs/005-edicion-datos-personajes/spec.md`: nombre, notas y estado.
- `specs/006-edicion-catalogos/spec.md`: clase, subclase y especie; selectores, opciones nuevas persistentes y relación clase/subclase.

No anticipar controles, contratos de escritura ampliados ni tablas de catálogos en 004. Los requisitos confirmados se conservan en esas especificaciones para retomarlos más adelante.

## Etapa siguiente
Plan en `specs/004-edicion-niveles/plan.md`. Tareas 1–6 implementadas y validadas en local en `tasks.md`; revisión del resultado por el usuario pendiente. Entrega local autorizada; no crear recursos remotos ni publicar.

## Ajuste visual confirmado del boceto
Editar y Guardar compactos, fondo gris oscuro y borde púrpura; relleno púrpura intenso solo en hover. Nivel a la izquierda y botones pequeños a su derecha, más arriba y menos abajo. Boceto compacto aprobado e implementado en local.
