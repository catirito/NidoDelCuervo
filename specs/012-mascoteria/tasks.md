# Tareas — 012: Mascotería

Implementación y validación locales completadas. El [plan](plan.md) recoge el diseño y la [especificación](spec.md) contiene los criterios de aceptación.

## Orden de ejecución

- [x] **T01. Esquema y vínculos en D1.** Aplicar la migración en local. Comprobar nombre obligatorio, campos opcionales, unicidad de la pareja mascota–personaje y conservación de vínculos con bajas lógicas. Cubre CA-03 y CA-04.
- [x] **T02. Importación.** Tras T01, preparar el informe previo y probar una carga local. Conciliar 55 entradas (24/7/4/20), las tres filas sin nombre, la nota de los cebos, las seis mascotas sin propietario y los tres vínculos de Tinka. Probar que una coincidencia ambigua bloquea la carga y que repetirla conserva las ediciones posteriores. Cubre CA-03 a CA-05.
- [x] **T03. Consulta y filtros.** Tras T01, exponer el listado paginado y el catálogo de propietarios. Probar filtros combinados, valores vacíos, ausencia de duplicados y visualización del nombre oficial tras renombrar o dar de baja un personaje. Cubre CA-02 y CA-03.
- [x] **T04. Altas, edición y bajas.** Tras T03, probar altas con solo nombre, selección de cero o varios propietarios, reintentos y conflictos sin escrituras parciales. Comprobar que editar datos conserva los vínculos válidos existentes. Rechazar nuevas asignaciones a personajes dados de baja y peticiones públicas que intenten asignar o subir imágenes. Cubre CA-02, CA-03, CA-06 y CA-07.
- [x] **T05. Navegación y página.** Tras T02–T04, integrar el menú y los flujos de consulta y edición. Comprobar temas, móvil, teclado, selector múltiple y borradores al paginar o fallar el guardado. Verificar las cuatro columnas de datos. Cubre CA-01 a CA-04 y CA-07.
- [x] **T06. Exportación.** Tras T03 y T05, exportar las mascotas activas guardadas con Nombre, Propietario, Animal y Ubicación. Probar que salen todas aunque haya filtros o paginación, que cada mascota ocupa una fila con sus propietarios oficiales y que se excluyen bajas e imágenes. Cubre CA-06.
- [x] **T07. Validación local y paquete.** Tras T01–T06, ejecutar las regresiones del registro, recorrer CA-01 a CA-07 e inspeccionar el paquete público. Confirmar que el Excel original y la documentación interna quedan fuera. Registrar comandos, resultados y límites antes de presentar la entrega. Cubre CA-05 y consolida los demás criterios.

Aplicar TDD a cada cambio funcional mediante las pruebas previstas en el plan. Registrar evidencia al cerrar cada tarea. La publicación se autoriza por separado.

## Verificación de la etapa de especificación

- Lectura de ambos libros, inspección de las referencias y anclajes de imagen en el XLSX, y consulta de la API de personajes en modo de solo lectura. El recuento y las incidencias constan en la especificación.
- Confirmadas las reglas de propiedad inicial. Se han cotejado las cinco celdas con `Nido`, la celda de propietario vacía y los tres personajes de la fila de Tinka con el Excel y la consulta ya obtenida del registro activo.
- La inspección del Excel confirmó 39 archivos de imagen internos. El alcance vigente aplaza su uso.
- SHA-256 del Excel de Mascotería idéntico antes y después del traslado. `git check-ignore` confirma que la ruta local está excluida. El paquete generado mediante `scripts/build-cloudflare.mjs` en un directorio temporal no incluye libros XLSX ni esta documentación.
- Las pruebas existentes `tests/records.test.mjs` y `tests/export-excel.test.mjs` pasan con el runtime Node de Codex. Cubren el registro vigente. La evidencia funcional posterior figura en la sección siguiente.


## Validación local del 9 de noviembre de 2026

| Tareas | Comprobación | Resultado |
| --- | --- | --- |
| T01–T04 | `node tests/mascoteria-api.test.mjs` en D1 aislada | Nombre obligatorio, unicidad de vínculo, filtros combinados y vacíos, nombres oficiales, propietarios dados de baja, reintentos, conflicto atómico y concurrencia. Rechazo de formularios con archivos y campos de imagen. |
| T02 | `node tests/mascoteria-import.test.mjs` en D1 aislada | 55 entradas en 24/7/4/20 por ubicación, cuatro exclusiones, seis sin propietario, tres vínculos de Tinka, nombres repetidos, bloqueo por ambigüedad y segunda ejecución sin sobrescribir ediciones o bajas. |
| T02 | `wrangler d1 migrations apply nido-personajes-local --local`, `node scripts/import-mascoteria.mjs` y `node scripts/import-mascoteria.mjs --apply` | Migraciones locales 0005 a 0007 aplicadas. Informe previo con cero incidencias. D1 poblada con 55 mascotas. Informe privado en `.local/imports/012-mascoteria/report.json`. |
| T05–T06 | `node tests/mascoteria-ui.test.cjs` y `node tests/mascoteria-export.test.mjs` | Chrome de escritorio a 1440 px y emulación móvil a 320 px, ambos temas y navegación por teclado. Filtros para cada propietario de Tinka, alta con solo nombre, selección múltiple, borrador entre páginas y tras un fallo, guardado tras reintentar, baja y descarga completa con filtros activos. XLSX de cuatro columnas, texto literal, celdas vacías y ausencia de medios y enlaces. |
| T07 | Pruebas vigentes del Registro | Pasaron `records`, `export-excel`, `search-initialization`, `api`, `catalogs`, `character-editing`, `create-character`, `pagination`, `soft-delete` y las siete suites de navegador de catálogos, edición, altas, exportación, paginación, recuperación y bajas. Se ejecutaron secuencialmente las que usan la D1 local. |
| T07 | `node scripts/build-cloudflare.mjs`, inspección del paquete y peticiones locales | Las dos páginas y los recursos nuevos responden 200. El paquete excluye libros, documentación, migraciones y pruebas. Las peticiones directas a las rutas privadas devuelven 404. Git ignora el libro privado. La API devuelve 55 mascotas y 203 personajes activos. |

Pruebas de Mascotería escritas antes de cada bloque. Se observaron fallos iniciales por ausencia del esquema, importador, enlace de navegación y función XLSX. Las ejecuciones finales usaron Node 24.22.1, el Miniflare incluido en Wrangler 4.147.0 y Playwright del runtime de Codex con Chrome local. Las variables `MINIFLARE_MODULE` y `PLAYWRIGHT_MODULE` apuntaron a sus instalaciones existentes.

Servidor de revisión levantado con `wrangler pages dev .local/public --ip 127.0.0.1 --port 8788`. Mascotería está en `http://127.0.0.1:8788/mascoteria`. Captura de escritorio en `.local/mascoteria-012.png`.

Alcance de las pruebas de navegador limitado a Chrome. No se ejecutó `tests/ui.test.cjs`, que espera las 203 filas en la carga inicial, un contrato anterior a la paginación vigente. Las altas de la prueba de navegador se dieron de baja en D1 local. La importación y la revisión se hicieron en local. La publicación y la revisión en otros navegadores quedan pendientes.

## Ajuste local del 10 de noviembre de 2026

- La prueba de API verifica el orden por ubicación prioritaria, Animal y valores vacíos. El servidor de revisión devuelve las 55 entradas activas en el orden esperado.
- La prueba de Chrome verifica que el alta admite un Animal y una Ubicación nuevos y que en edición se puede elegir una ubicación existente y seleccionar varios propietarios del Registro. También vuelve a recorrer guardado, exportación y baja.
- En Chrome local, el selector nativo añadió dos personajes consecutivos, volvió a la opción inicial después de cada elección y retiró las opciones ya seleccionadas. El guardado conservó ambos vínculos al recargar.
- En Chrome local, los cuatro botones de la cabecera en modo de edición tienen un tamaño de letra de 13 px. La prueba reproducía antes la diferencia entre 13 y 16 px.
