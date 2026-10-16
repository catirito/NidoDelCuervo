# Plan — 011: actualizar logo y favicon

Estado: cerrada el 16 de octubre de 2026. Implementación y validación local completadas, resultado aceptado visualmente por el usuario e integrado en `main`. Código `8bd2304` publicado en producción mediante despliegue `5c95cb28-e4ee-4318-98b9-32a2a628b5d3`; comprobación remota completada. Evidencia de cierre en tasks.md.

## Resultado previsto
La cabecera mostrará una copia exacta del PNG aportado, conservando su transparencia y composición. La pestaña usará favicons derivados del mismo motivo, con encuadre adaptado solo si mejora su legibilidad. La web conservará su presentación y comportamiento actuales.

## 1. Recursos y fidelidad
- Copiar el original a `assets/logo-cuervo-011.png` sin reprocesarlo. Conservar sus 5.000 × 5.000 píxeles y todos sus bytes; comparar SHA-256 del origen y la copia antes de darla por válida. La imagen de 2,1 MB se conserva por la decisión expresa de usar el archivo tal cual, aunque no sea óptima para una presentación pequeña.
- Mantener el original externo intacto. Tras la copia, la web dependerá exclusivamente del recurso del repositorio; ninguna ruta absoluta del Mac se incorporará al HTML o al paquete público.
- Preparar por separado `assets/favicon-cuervo-011-16.png` y `assets/favicon-cuervo-011-32.png`, RGBA y cuadrados. Empezar con el dibujo completo y proporciones conservadas, sin estirarlo; revisar ambos a tamaño real.
- Si el motivo completo resulta ilegible, ajustar el encuadre de los favicons dentro de la autorización del usuario. Conservar el cuervo reconocible, sin redibujar, cambiar colores ni modificar el archivo de cabecera. Mostrar el resultado y su comparación con el dibujo completo en la revisión visual; si ninguna variante es satisfactoria, registrar la limitación y volver a clarificación.
- Utilizar las herramientas de imagen ya disponibles; no instalar librerías ni añadir dependencias al proyecto. Se ha comprobado la disponibilidad de Pillow en el Python del runtime de Codex; el Python habitual del shell no lo incorpora. Resolver la ruta del runtime al ejecutar, sin convertirla en requisito del producto.

## 2. Integración en HTML y presentación
- Actualizar únicamente el `src` de la imagen de cabecera en `index.html`. Conservar `width="70"`, `height="70"`, `alt=""` y `aria-hidden="true"`: el nombre visible ya identifica la web.
- Mantener las reglas de `styles.css`: 70 × 70 en escritorio, 54 × 54 a anchuras de hasta 760 px, `object-fit: contain` y espacio actual junto al nombre. No se prevé modificar CSS; un defecto de encaje obligaría a revisar la solución antes de ampliar el diseño.
- Sustituir el enlace de favicon actual por dos enlaces PNG con `sizes="16x16"` y `sizes="32x32"`, referenciando los derivados correspondientes.
- Usar nombres nuevos con el identificador 011 para que el navegador solicite los recursos nuevos en lugar de reutilizar la URL del logo anterior. No añadir políticas globales de caché, scripts para vaciarla ni un servicio de caché.
- No incorporar ICO, manifiesto, iconos de instalación ni variantes para redes sociales: no son necesarios para el alcance acordado.

## 3. Paquete público
- Actualizar la lista explícita de `scripts/build-cloudflare.mjs`: incluir los tres recursos nuevos y retirar el PNG anterior de esa lista cuando ya no tenga referencias activas. No eliminar antecedentes del repositorio como limpieza ajena al cambio.
- Mantener las demás entradas y las exclusiones actuales. No modificar Functions, configuración de D1, migraciones o despliegue.
- Ejecutar el comando existente `node scripts/build-cloudflare.mjs` durante validación. Inspeccionar la salida para confirmar que el HTML referencia archivos presentes y que no se incluyen el Excel, documentos internos ni el original externo.

## 4. Validación proporcional y evidencia
Comprobaciones ejecutadas durante la implementación autorizada; resultados y límites en `specs/011-actualizar-logo/tasks.md`. La tabla siguiente conserva el diseño de validación aplicado.

| Criterio de la spec | Comprobación prevista |
| --- | --- |
| CA-01 | Hash idéntico entre original y copia; carga y proporciones de la imagen en cabecera. |
| CA-02 | Inspección de los PNG a 16/32 px sobre fondos claro y oscuro, y revisión de la pestaña de Chrome local en una carga nueva. Verificar enlaces y respuestas HTTP; un `link rel="icon"` correcto por sí solo no acredita que la pestaña muestre la imagen. |
| CA-03 | Capturas de cabecera a 1440, 390 y 320 px en ambos temas; inspección de cortes, solapamientos, escala y desbordamiento. |
| CA-04 | Nombre visible, atributos accesibles conservados, enlace de salto y recorrido por teclado del selector de tema. No declarar prueba con lector de pantalla si no se ejecuta. |
| CA-05 | Recursos locales con respuesta correcta, sin errores de carga de imágenes ni errores JavaScript introducidos por el cambio. |
| CA-06 | Build por lista explícita, inspección de archivos de salida y diff limitado a recursos, referencias, build y documentación autorizados. |

- Usar Chrome y los mecanismos locales ya empleados por el proyecto. Para capturas y comprobaciones de página puede reutilizarse Playwright con Chrome instalado; la representación del favicon en la pestaña requiere además revisión del navegador con interfaz visible.
- Verificar el HTML del paquete generado, además de los recursos fuente. Si hace falta servirlo, usar el servidor estático local empleado en las validaciones anteriores, comprobando primero su disponibilidad y el puerto; registrar el comando real, sin asumir que sigue activo.
- Para este cambio no hacen falta pruebas de escritura ni una D1 local. La revisión de cabecera y favicon puede hacerse con respuestas de API simuladas mediante los mecanismos existentes, sin confundirlas con una validación funcional del registro.
- No repetir la suite de edición, catálogos o persistencia si el diff sigue limitado al alcance descrito. No crear pruebas permanentes que solo repitan rutas de imágenes o tamaños declarados.
- Registrar hashes, dimensiones y peso finales, navegador y anchuras usados, capturas revisadas, resultados y limitaciones en la evidencia de 011 al ejecutar la validación. Si la caché de favicon impide confirmar la pestaña, dejar CA-02 pendiente hasta comprobarlo en un perfil limpio o una carga que descarte esa caché.
- Cerrar la revisión documental con `git diff --check` y coherencia entre spec, plan, tareas y `Memories.md`.

## 5. Orden y límites de la siguiente etapa
Tareas ejecutadas, validación local y remota completada, y resultado aceptado por el usuario. Código integrado, subido y publicado; cierre y evidencia remota en tasks.md. No se necesitó adaptar el encuadre de los favicons ni modificar CSS.

Trabajo realizado en `codex/011-actualizar-logo`, integrado por avance rápido en `main` y subido a GitHub. Publicación completada con el commit `8bd2304`; el cierre documental posterior no cambia el paquete publicado. No se han modificado datos ni migraciones.
