# 011 — Actualizar logo y favicon

Estado: cerrada el 16 de octubre de 2026. Implementación y validación local completadas, resultado aceptado visualmente por el usuario e integrado en `main`. Código `8bd2304` publicado en producción mediante despliegue `5c95cb28-e4ee-4318-98b9-32a2a628b5d3`; comprobación remota completada. Evidencia de cierre en tasks.md.

## Objetivo
Actualizar la identidad gráfica de la web con el logo aportado por el usuario y utilizarlo también como favicon, para que la cabecera y la pestaña del navegador identifiquen Nido del Cuervo con la misma imagen.

## Petición y fuente confirmadas
- El usuario solicita sustituir el logo de la web y ponerlo también como favicon.
- Imagen elegida: `Nido_Del_Cuervo_Logo_Borders.png`, facilitada en la conversación y disponible en `/Users/bruno/DnD/Cuervos/Nido_Del_Cuervo_Logo_Borders.png`.
- El archivo local tiene 5.000 × 5.000 píxeles, modo RGBA y transparencia efectiva comprobada en lectura: alfa entre 0 y 255, esquinas y puntos medios de los cuatro bordes con alfa 0. El rectángulo que contiene píxeles no transparentes es `(533, 9, 4467, 4991)` con coordenadas de Pillow. Esto no sustituye la revisión visual futura.
- El motivo aportado representa un cuervo con un dado y contorno blanco. No se solicita un rediseño del dibujo ni una nueva paleta para la interfaz.
- El original del usuario se conserva intacto.

## Punto de partida comprobado antes de implementar
- `index.html` usa `assets/logo-cuervo.png` tanto en la cabecera como en el enlace de favicon PNG.
- La imagen de cabecera tiene dimensiones declaradas de 70 × 70, acompañada por el nombre visible «Nido del Cuervo». Actualmente es decorativa para tecnologías de asistencia (`alt=""` y `aria-hidden="true"`).
- La web dispone de temas claro y oscuro y presentación adaptable a móvil.
- `scripts/build-cloudflare.mjs` incluye el PNG actual mediante una lista explícita de archivos públicos. Cualquier recurso nuevo necesario deberá formar parte del paquete público cuando se implemente.
- La identidad anterior está documentada en `specs/002-diseno-visual/`. Esta spec sustituye en la implementación local únicamente su elección de logo/favicon; las demás decisiones visuales permanecen vigentes.

## Historia de usuario
Como visitante de Nido del Cuervo, quiero reconocer el nuevo cuervo en la cabecera y en la pestaña del navegador para identificar la web de forma coherente tanto al usarla como al alternar entre pestañas.

## Requisitos
- RF-01. Sustituir la imagen anterior de la cabecera por el logo aportado, conservando sus proporciones y evitando deformaciones o cortes involuntarios.
- RF-02. Usar el mismo motivo como favicon de la web. Las variantes de resolución necesarias deben conservar la identidad del logo y no introducir otro símbolo.
- RF-03. Mantener el logo reconocible en los temas claro y oscuro y en móvil y escritorio, sin solapamientos con el título o los controles ni desbordamiento de página causado por la imagen.
- RF-04. Conservar el nombre visible de la web y evitar anuncios redundantes de su identidad a través de tecnologías de asistencia.
- RF-05. Servir las imágenes desde los recursos de la propia web, sin servicios externos ni nuevas dependencias de ejecución.
- RF-06. Incluir los recursos utilizados en el paquete público que prepara el proyecto, sin incluir el Excel histórico, documentos internos ni la ruta local del original como dependencia de la web.

## Límites
- Mantener tipografías, colores de la interfaz, temas, contenido y comportamiento del registro. No modificar consultas, edición, exportación, API, esquema ni datos de D1.
- No añadir animaciones, rediseñar la cabecera ni ampliar el alcance a iconos de instalación, manifiesto PWA o imágenes para redes sociales.
- La implementación autorizada se limita a recursos, referencias HTML y lista de build; sin modificar CSS o lógica JavaScript.
- No modificar retrospectivamente las evidencias históricas de la spec 002 para presentarlas como validación del nuevo logo. La nueva decisión y sus evidencias corresponderán a 011.

## Clarificaciones resueltas
1. **Logo de cabecera:** el usuario elige «Conservar el archivo exactamente como está». Copiar el original sin modificar sus píxeles, dimensiones, transparencia, fondo, contorno o encuadre. La escala de presentación en la web no altera el archivo.
2. **Favicon pequeño:** el usuario elige «Permitir adaptar el encuadre si hace falta». Se permite generar recursos derivados y ajustar su encuadre para mejorar la legibilidad a 16/32 píxeles. No se autoriza redibujar o sustituir el motivo.

El plan mantiene el espacio actual de la cabecera. El ajuste opcional del favicon no afecta al archivo usado por la cabecera.

## Criterios de aceptación
1. CA-01 / RF-01: la cabecera muestra una copia idéntica del archivo aportado, con proporciones correctas. La igualdad de hash acredita que no se han modificado sus píxeles, fondo, contorno o encuadre; el original permanece intacto.
2. CA-02 / RF-02: una carga nueva de la web muestra el nuevo favicon en la pestaña del navegador de validación. Se revisa su aspecto a 16 y 32 píxeles conforme al encuadre acordado, registrando cualquier límite de legibilidad.
3. CA-03 / RF-03: revisión visual en escritorio y en móvil de 390 y 320 píxeles, en claro y oscuro, sin cortes involuntarios, deformación, solapamientos o desbordamiento de página causado por el logo.
4. CA-04 / RF-04: el nombre «Nido del Cuervo» sigue visible y la imagen no duplica innecesariamente su anuncio accesible. El cambio no altera el acceso por teclado a los controles de cabecera.
5. CA-05 / RF-05: los recursos de logo y favicon se resuelven desde la web sin errores de carga ni dependencia de la ruta local del archivo original.
6. CA-06 / RF-06: el paquete público contiene las imágenes referenciadas y mantiene excluidos los archivos privados. La revisión del cambio confirma que no se han modificado datos ni funciones ajenas al alcance.

## Validación y siguiente etapa
CA-01–CA-06 verificados localmente en Chrome; evidencia y límites en `specs/011-actualizar-logo/tasks.md`. Se ha conservado el archivo original exacto para la cabecera y generado favicons del dibujo completo, sin recorte. Los detalles pequeños del dado pierden legibilidad a 16 px.

Spec cerrada: resultado aceptado, commit `8bd2304` integrado y subido a GitHub en rama 011 y `main`, y publicado en https://nido-del-cuervo.pages.dev. Los recursos remotos coinciden con los locales; validación remota y límites en tasks.md. No quedan tareas de esta spec pendientes.
