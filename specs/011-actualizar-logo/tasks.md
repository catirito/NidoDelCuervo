# Tareas — 011: actualizar logo y favicon

Estado: implementación autorizada por el usuario y completada el 16 de octubre de 2026 en `codex/011-actualizar-logo`. T001–T008 ejecutadas y validación local completada; resultado aceptado visualmente por el usuario, que autoriza commit, push, publicación y cierre. Entrega en curso.

Referencias: `specs/011-actualizar-logo/spec.md` y `specs/011-actualizar-logo/plan.md`. Las casillas se cierran con la evidencia de ejecución recogida al final de este documento.

## 1. Preparar los recursos
- [x] **T001 — Incorporar la copia exacta del logo.** Comprobar la rama y la disponibilidad del original, registrar su SHA-256 y copiarlo sin reprocesar a `assets/logo-cuervo-011.png`. **Fin:** origen y copia tienen el mismo hash, dimensiones y peso; original intacto. Cubre CA-01.
- [x] **T002 — Preparar los favicons.** Generar `assets/favicon-cuervo-011-16.png` y `assets/favicon-cuervo-011-32.png` con dibujo completo, proporciones conservadas y transparencia, en RGBA de 16 × 16 y 32 × 32. Revisarlos a tamaño real sobre fondos claro y oscuro. Si hace falta, adaptar únicamente su encuadre y preparar comparación con el dibujo completo; no redibujar ni cambiar colores. **Fin:** recursos preparados y resultado visual mostrado para revisión; cualquier límite de legibilidad queda explícito. Si ninguna variante funciona, volver a clarificación antes de integrar el favicon. Cubre la preparación de CA-02; no acredita todavía su visualización en la pestaña.

Dependencias: T002 requiere la fuente comprobada en T001. Utilizar herramientas disponibles sin instalar dependencias. No modificar el archivo de cabecera para adaptar los favicons.

## 2. Integrar referencias y paquete público
- [x] **T003 — Actualizar las referencias HTML.** Cambiar el `src` de cabecera a la copia 011 y sustituir el favicon anterior por los dos enlaces PNG con sus respectivos `sizes`. Conservar nombre visible, dimensiones declaradas, atributos accesibles y CSS actual (70 px en escritorio y 54 px en móvil). **Fin:** las tres referencias corresponden a archivos preparados, sin rutas absolutas del Mac ni cambios de comportamiento. Cubre CA-01, CA-04 y parte de CA-05.
- [x] **T004 — Ajustar el build público.** Incluir los tres recursos 011 en la lista explícita de `scripts/build-cloudflare.mjs`. Retirar de esa lista el PNG anterior tras comprobar que no quedan referencias activas; conservarlo en el repositorio como antecedente. **Fin:** lista pública coherente con el HTML, sin cambios en las demás entradas ni en Functions, D1 o migraciones. Cubre la preparación de CA-06.

Dependencias: T003 requiere T001–T002 y la revisión visual de los derivados; T004 requiere las referencias definitivas de T003.

## 3. Validar el resultado local
- [x] **T005 — Comprobar el paquete generado.** Ejecutar `node scripts/build-cloudflare.mjs`; inspeccionar archivos y referencias de salida, hashes del logo y dimensiones de favicons. **Fin:** recursos presentes y coherentes, Excel histórico y documentación interna excluidos; comandos y resultados registrados. Cubre CA-01, CA-05 y CA-06. No equivale a desplegar.
- [x] **T006 — Revisar la cabecera y accesibilidad.** Servir el paquete local con el mecanismo existente, comprobando herramientas y puerto. Revisar Chrome a 1440/390/320 px en claro y oscuro; inspeccionar capturas, proporciones, cortes, solapamientos, desbordamiento, nombre visible, atributos accesibles, enlace de salto y teclado del selector de tema. **Fin:** CA-01, CA-03 y CA-04 verificados o con defectos explícitos; recursos cargados correctamente y sin errores JavaScript introducidos. Registrar si se simula la API; no realizar escrituras ni presentar la simulación como prueba del registro.
- [x] **T007 — Comprobar el favicon en la pestaña.** Revisar enlaces y respuestas HTTP, y abrir la web local en Chrome con interfaz visible para comprobar el favicon. Si la caché impide confirmarlo, usar una carga que la descarte o un perfil limpio, sin alterar el perfil habitual del usuario. **Fin:** favicon nuevo visible en la pestaña y legibilidad documentada a 16/32 px; CA-02 y carga de CA-05 acreditados. Si solo se comprueban etiquetas o peticiones, dejar CA-02 pendiente.

Dependencias: T005 requiere T003–T004; T006–T007 requieren T005. Corregir únicamente defectos del alcance y repetir las comprobaciones afectadas por cada corrección. No ejecutar pruebas de escritura de D1 ni suites de persistencia si el cambio mantiene el alcance aprobado.

## 4. Documentar y entregar para revisión
- [x] **T008 — Cerrar evidencia y coherencia documental.** Registrar en este documento los comandos ejecutados, hashes, dimensiones/pesos, navegador, capturas revisadas, resultados por CA-01–CA-06 y limitaciones. Actualizar estados de spec, plan, tareas y `Memories.md`, distinguiendo implementación, validación técnica, revisión visual del usuario y publicación. Ejecutar `git diff --check` y comprobar rama y diff final. **Fin:** evidencia trazable, estados coherentes y resultado local presentado para revisión; ningún criterio pendiente declarado como superado.

Dependencias: T008 recoge los resultados de T001–T007. Una limitación puede documentarse sin cerrar la tarea de validación afectada ni declarar aceptación global.

## Orden y límites
Recursos → revisión visual de derivados → HTML → lista de build → paquete generado → comprobaciones locales → evidencia y revisión final. El ajuste opcional del favicon no amplía el alcance al logo original, paleta o cabecera.

La autorización posterior del usuario («adelante, implementalo») permite implementar y comprobar este alcance local. Commit, push, integración y despliegue autorizados para esta entrega. No realizar migraciones ni escrituras de prueba en producción. La rama remota conserva el commit base; los documentos siguen locales y sin commit.

## Evidencia de ejecución — 16 de octubre de 2026
- T001: original y copia `assets/logo-cuervo-011.png` idénticos: SHA-256 `58dc84ea9994e77a185ec20af1c48aef41375cd27f1f00a36cf2d967b7a609ad`, 2.210.763 bytes, RGBA, 5.000 × 5.000. Comprobación repetida contra la copia del paquete público. Original intacto.
- T002: derivados deterministas mediante Pillow disponible en `/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`, reducción Lanczos del lienzo completo. No se ha necesitado adaptar el encuadre. PNG 16 × 16: 866 bytes, SHA-256 `84310d7e8e784ac1532161205c23ac9acddf0f23919b3a1ee0d6bd1f2ffb1808`. PNG 32 × 32: 2.330 bytes, SHA-256 `311e05155678839ebb25c0e128912dbe4dc13329a1daf72c0ad71b0bf3cc7e8e`. Motivo y contorno reconocibles; los números del dado pierden detalle a 16 px. Comparación a tamaño real en `specs/011-actualizar-logo/evidencias/recursos.png`, mostrada al usuario; no supone su aceptación explícita.
- T003–T004: `index.html` referencia los tres recursos 011; tamaño, accesibilidad y CSS conservados. Lista de build actualizada, antiguo PNG conservado en el repositorio y excluido del paquete. No se han modificado lógica, API, D1, migraciones ni dependencias.
- T005: `node scripts/build-cloudflare.mjs` pasa. Comprobados archivos referenciados y ausencia del logo anterior, Excel, `Memories.md`, `AGENTS.md` y `specs/` en `.local/public`.
- T006: comprobación temporal `/private/tmp/nido-011-check.cjs`, ejecutada con `/Users/bruno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/nido-011-check.cjs`. Chrome `155.0.8059.79`, Playwright existente, seis vistas a 1440/390/320 px en claro y oscuro. Pasa carga de PNG original (naturalWidth 5.000), tamaño presentado 70/54 px, proporciones, ausencia de solapamiento imagen/título y de desbordamiento horizontal de página. Enlace de salto recibe el primer Tab; selector de tema el segundo y responde a Enter. Atributos `alt`/`aria-hidden` conservados. Cero errores JavaScript/HTTP y cero solicitudes de escritura. Capturas inspeccionadas; resumen de cabeceras en `specs/011-actualizar-logo/evidencias/cabeceras.png`.
- T007: enlaces 16/32 y respuestas HTTP PNG correctos. Además, revisión con interfaz visible de Chrome mediante CUA en `http://127.0.0.1:8791`: nuevo cuervo visible en la pestaña y cabecera. No fue necesario borrar caché ni cambiar el perfil del usuario.
- Entorno: paquete servido con `node /private/tmp/nido-011-server.cjs "$PWD/.local/public"` en `127.0.0.1:8791`. Servidor temporal estático con respuesta vacía simulada de GET `/api/characters`, sin acceso a D1 y sin escrituras. No equivale a validar consultas o persistencia reales. El sandbox requirió permiso para escuchar el puerto y lanzar Chrome. Node habitual 16.13 no soportó Playwright; se resolvió usando el runtime existente, sin instalaciones.
- T008: revisados estados y coherencia de spec/plan/tasks/Memories, rama y diff; `git diff --check` pasa. Resultado local presentado para aceptación visual, no publicado.

| Criterio | Resultado local |
| --- | --- |
| CA-01 | Verificado: hash idéntico y proporciones correctas. |
| CA-02 | Verificado: PNG a 16/32 y favicon visible en pestaña de Chrome. Límite de detalle del dado a 16 px documentado. |
| CA-03 | Verificado: seis vistas, inspección visual y ausencia de solapamientos/desbordamiento. |
| CA-04 | Verificado: nombre y atributos conservados, teclado comprobado. |
| CA-05 | Verificado: recursos locales correctos, sin errores de carga. |
| CA-06 | Verificado: paquete y diff acotados, archivos internos excluidos. |

Límites: aceptación visual del usuario confirmada; no se ha probado con lector de pantalla, otros navegadores ni en producción. No se han repetido suites de persistencia porque el diff no afecta a lógica o datos. Los scripts temporales y capturas completas de `/private/tmp` no son infraestructura permanente de pruebas; las dos imágenes resumen se guardan en 011. La rama remota sigue en el commit base y no se ha publicado esta implementación.
