# Tareas — 012: Mascotería

Pendientes de planificación y desglose. Se ha completado la inspección inicial de fuentes en lectura, con resultados y límites registrados en la [especificación](spec.md). La reconciliación definitiva, la implementación, las pruebas del producto y la publicación quedan pendientes.

## Verificación de la etapa de especificación

- Lectura de ambos libros, inspección de las referencias y anclajes de imagen en el XLSX, y consulta de la API de personajes en modo de solo lectura. El recuento y las incidencias constan en la especificación.
- SHA-256 del Excel de Mascotería idéntico antes y después del traslado. `git check-ignore` confirma que la ruta local está excluida. El paquete generado mediante `scripts/build-cloudflare.mjs` en un directorio temporal no incluye libros XLSX ni esta documentación.
- Las pruebas existentes `tests/records.test.mjs` y `tests/export-excel.test.mjs` pasan con el runtime Node de Codex. Cubren el registro vigente. La nueva página, la importación y las imágenes todavía no tienen validación funcional.
