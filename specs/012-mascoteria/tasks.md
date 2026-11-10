# Tareas — 012: Mascotería

Especificación cerrada. Aceptación, integración y publicación en producción verificadas. El [plan](plan.md) recoge el diseño y la [especificación](spec.md) contiene los criterios de aceptación.

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

Alcance de las pruebas de navegador limitado a Chrome. No se ejecutó `tests/ui.test.cjs`, que espera las 203 filas en la carga inicial, un contrato anterior a la paginación vigente. Las altas de la prueba de navegador se dieron de baja en D1 local. La importación y la revisión se hicieron en local. La revisión en otros navegadores queda pendiente. El despliegue posterior de pruebas se documenta más abajo.

## Ajuste local del 10 de noviembre de 2026

- La prueba de API verifica el orden por ubicación prioritaria, Animal y valores vacíos. El servidor de revisión devuelve las 55 entradas activas en el orden esperado.
- La prueba de Chrome verifica que el alta admite un Animal y una Ubicación nuevos y que en edición se puede elegir una ubicación existente y seleccionar varios propietarios del Registro. También vuelve a recorrer guardado, exportación y baja.
- En Chrome local, el selector nativo añadió dos personajes consecutivos, volvió a la opción inicial después de cada elección y retiró las opciones ya seleccionadas. El guardado conservó ambos vínculos al recargar.
- En Chrome local, los cuatro botones de la cabecera en modo de edición tienen un tamaño de letra de 13 px. La prueba reproducía antes la diferencia entre 13 y 16 px.


## Entorno de pruebas del 10 de noviembre de 2026

- URL compartible con edición pública y cabecera `noindex`: [Mascotería](https://nido-del-cuervo-012-test.pages.dev/mascoteria). Proyecto Pages independiente `nido-del-cuervo-012-test`, rama de Pages `staging`, Direct Upload con Wrangler 4.147.0. Despliegue `a7947c0d-7beb-414a-95bc-d26862917664` desde el commit local `4fe546b`.
- Verificado en la configuración remota: `DB` enlaza a `nido-mascoteria-012-test` (`8274a085-4ef0-4db5-863a-5961ac6c3f8a`). Producción usa `nido-personajes` (`3107c487-41dd-4cb0-a4e6-6e46027d9c40`). Las comprobaciones de datos por CLI se validaron con nombre y UUID explícitos, ya que la consulta por alias `DB` con la configuración descargada resolvió la D1 de pruebas.
- Aplicadas las migraciones 0001–0007 en test. La semilla de personajes y catálogos procede de D1 local y se validó contra las migraciones en SQLite con integridad y claves foráneas. La carga de mascotas se regeneró con `readPetSource` y `planPetImport`: 55 filas, cuatro exclusiones y cero propietarios sin resolver. Regenerar desde el libro preservó las 55 entradas iniciales, incluida A24, que estaba dada de baja en la copia local. D1 remota y API confirmaron 203 personajes y 55 mascotas activas, seis sin dueño, Tinka con sus tres propietarios y prioridad de Mascotería seguida del orden por Animal. La distribución de la semilla es 24/7/4/20.
- Repetidas las 12 suites de Node con `node --test --test-concurrency=1 tests/*.test.mjs`, todas correctas. Pasó `node tests/mascoteria-ui.test.cjs` en local. En remoto pasó el mismo recorrido con una copia temporal del test, limitada por URL al proyecto aislado y con un nombre de prueba identificable. Chrome comprobó navegación con teclado, 1440 y 320 px, ambos temas, filtros, exportación de 55 filas, select acumulativo, nuevos valores en Animal y Ubicación, cuatro botones a 13 px, borradores, recuperación ante fallo, alta, edición y baja.
- D1 confirmó la baja lógica de la única mascota de prueba, con versión 2 y 55 activas al terminar. Durante esta revisión en staging, la D1 de producción aún carecía de tablas de mascotas y de migración 0007. El despliegue productivo seguía siendo `5c95cb28-e4ee-4318-98b9-32a2a628b5d3` antes y después. No se ejecutaron escrituras en producción.
- Los dos libros, documentación, SQL y configuración quedaron fuera del paquete público. Ocho rutas privadas devolvieron 404. Git ignora el Excel de Mascotería. El Excel histórico de personajes ya estaba versionado y queda fuera de los cambios de 012. La verificación de navegador se limita a Chrome.

### URL del entorno de pruebas

La URL del entorno de pruebas es [nido-del-cuervo-test.pages.dev/mascoteria](https://nido-del-cuervo-test.pages.dev/mascoteria). El proyecto Pages `nido-del-cuervo-test` publica el mismo commit `4fe546b` en el despliegue `dc3c7405`. Verificados el binding remoto a la D1 de pruebas existente, la respuesta idéntica de la API con 55 mascotas y 203 personajes, la fila A10 y las respuestas 404 del Excel histórico y la especificación. La URL anterior sigue disponible y ambos proyectos de pruebas comparten esa D1.

### Reproducir la corrección de A10 en una semilla nueva

Después de cargar las mascotas, confirmar que A10 conserva la ubicación Mascotería y un único vínculo a Regor. Si el nombre y el animal tienen los valores del Excel, ejecutar este ajuste únicamente contra la D1 de pruebas identificada arriba. Comprobar que cambia una fila y que el listado devuelve «25 ovejas», «Oveja», «Regor» y «Mascotería». Los vínculos y el Excel original se conservan.

```sql
UPDATE pets
SET name = '25 ovejas', animal = 'Oveja', version = version + 1
WHERE source_cell = 'A10'
  AND name = 'Ovejas' AND animal = '25 Ovejas' AND location = 'Mascotería'
  AND EXISTS (
    SELECT 1 FROM pet_owners
    JOIN characters ON characters.id = character_id
    WHERE pet_id = pets.id AND PERSONAJE = 'Regor'
  );
```


## Cierre y publicación del 10 de noviembre de 2026

- El usuario aceptó la revisión y autorizó el cierre, commit, push, merge y publicación. La rama `codex/012-mascoteria` se subió a GitHub y se integró por avance rápido en `main` mediante `16391a1`.
- Antes de publicar se repitieron las 12 suites de Node y el recorrido local de Chrome, con resultado correcto. Se exportó una copia privada de D1, se restauró en SQLite en memoria y se ensayaron la migración y la carga. Se verificaron la integridad, las claves foráneas, la conservación de todas las filas de personajes y el rechazo de una segunda carga. La copia previa está en `.local/backups/012-mascoteria/pre-012-production.sql`, fuera de Git y del paquete público.
- En la D1 productiva `nido-personajes` se aplicó únicamente `0007_mascoteria.sql`. La carga transaccional se preparó desde el Excel privado con el importador y los 206 personajes activos de producción. Se comprobó dentro de la carga que los propietarios seguían activos y conservaban sus nombres, y que el ajuste de A10 afectaba a una sola fila. El marcador de importación se guardó con las 55 mascotas y sus vínculos. La lectura posterior verificó el marcador, la distribución 24/7/4/20, seis mascotas sin propietario, A10 y 206 personajes activos.
- Publicado `16391a1` mediante Direct Upload en el proyecto Pages `nido-del-cuervo`, rama de Pages `codex/003-selector-tema`, despliegue `9ff00899-1b79-4262-bb16-1e6c8331cabc`. URL estable [Mascotería](https://nido-del-cuervo.pages.dev/mascoteria).
- Comprobación remota de solo lectura: 55 mascotas, 206 personajes, orden por ubicación y Animal, Tinka con tres vínculos y «25 ovejas» con Oveja, Regor y Mascotería. Cinco recursos coincidieron byte a byte con el paquete y ocho rutas privadas devolvieron 404. Chrome a 1440 y 320 px verificó navegación entre las dos páginas, teclado, búsqueda y descarga de las 55 mascotas con filtro activo. Cero errores JavaScript y cero peticiones de escritura de prueba. Las escrituras funcionales se comprobaron en local y pruebas. La validación de navegador se limitó a Chrome.
