# Tareas — edición de nombre, notas, estado y propietario

Estado: implementación autorizada y completada; validación local pasa. Commit local autorizado; sin push ni publicación. Diseño aprobado en `sketch/`. Push y publicación de 005 no autorizados. Rama: `codex/005-edicion-datos-personajes`, con 004 local como base; sin integración en main.

## 1. Fijar validación y normalización de campos
- [x] Permitir PERSONAJE, NOTAS, ESTADO y PROPIETARIO además de NIVEL; rechazar campos ajenos y cambios sin campos.
- [x] Exigir nombre no vacío; limitar nombre/estado/propietario a 50 caracteres y notas a 2.000.
- [x] Permitir limpiar notas, estado y propietario; distinguir campo omitido de null/vacío enviado.
- [x] Quitar espacios exteriores de estado/propietario y reutilizar grafía existente si solo cambian mayúsculas; preservar diferencias de acentos y espacios interiores, sin reescribir otras filas.
- [x] Concretar en la implementación una regla consistente de conteo de caracteres en cliente/servidor, conservando textos y saltos de línea de notas.
- [x] Revisar límites del cuerpo con las longitudes acordadas; aplicar lectura acotada y error explícito si se supera.

Resultado: validación compartida o equivalente, sin normalizar registros al leer ni añadir catálogos/tablas.

## 2. Extender escritura atómica en D1 local
- [x] Mantener GET /api/characters y ampliar PATCH /api/characters/batch sin crear endpoints adicionales.
- [x] Actualizar solo campos presentes; incrementar una vez la versión de cada personaje guardado y conservar UUID/sourceRow.
- [x] Calcular rango cuando cambie NIVEL; conservar nivel/rango si solo cambian textos.
- [x] Mantener condición conjunta de versiones para guardar todo el lote o ninguno, con SQL preparado.
- [x] Resolver reutilización de grafía de estado/propietario con valores existentes, incluida consistencia de opciones nuevas dentro del mismo lote; no fusionar filas ni crear entidades relacionadas.
- [x] Mantener respuestas, conflictos por UUID, cabeceras sin caché/noindex y API sin autenticación de 004.

Depende de 1. Resultado: modificación parcial de texto/nivel sin perder campos omitidos ni atomicidad.

## 3. Generalizar el borrador por campos
- [x] Mantener snapshot original y mapa por UUID/campo con versión esperada.
- [x] Retirar campos revertidos y personajes sin diferencias finales; combinar textos y niveles en un solo lote.
- [x] Mantener visibles hasta Guardar las filas que dejan de cumplir filtros/búsqueda por sus ediciones.
- [x] Evitar reconstruir filas en cada carácter; conservar foco, cursor y composición de texto.
- [x] Mantener borrador al cambiar explícitamente filtros, sin perder cambios en filas ocultas.

Depende de 1. Resultado: borrador local sin peticiones intermedias.

## 4. Implementar los controles aprobados
- [x] Nombre con input y notas con textarea dentro de sus celdas, con límites y nombres accesibles.
- [x] Estado y propietario con selectores de valores existentes, opción vacía y opción de añadir texto.
- [x] Mostrar input debajo del selector solo al añadir valor nuevo; guardar ese valor únicamente con el lote.
- [x] Derivar opciones de las columnas de personajes, sin nuevas tablas. Incorporar opciones guardadas al actualizar los registros.
- [x] Conservar Editar/Guardar y controles de nivel compactos, temas, foco visible y tabla móvil.
- [x] Señalar filas/campos pendientes y errores asociados a controles; usar textContent/valores de formulario, sin interpretar HTML.

Depende de 3. Resultado: interfaz fiel al boceto aprobado y operable con teclado.

## 5. Guardar y reconciliar todos los campos
- [x] Enviar un PATCH con solo campos cambiados y una versión por personaje; sin cambios, salir de edición sin escribir.
- [x] Bloquear todos los campos editables y envíos duplicados mientras se guarda.
- [x] Tras éxito, aplicar respuesta/versiones, limpiar borrador, regenerar opciones, volver a consulta y reaplicar filtros preservando tema y ordenación.
- [x] En conflicto conservar borrador, consultar última versión y mostrar valor actual/propuesta de campos afectados antes de permitir reenvío.
- [x] Retirar campos cuyo valor deseado ya esté guardado; conservar los demás para revisión explícita.
- [x] Mantener recuperación de respuesta perdida sin reintentos automáticos y aviso al recargar con cambios pendientes.

Depende de 2 y 4. Resultado: recuperación de texto y nivel sin sobrescritura ni pérdidas silenciosas.

## 6. Validar y entregar fuera de producción
- [x] Probar D1 local: campos separados/combinados, nombre repetido o cambiado con UUID estable, omisión/null, límites y tipos, valores nuevos y variantes de estado/propietario.
- [x] Probar conflictos entre textos y niveles, concurrencia y ausencia de guardado parcial en un lote mixto.
- [x] Verificar navegador local: cursor/teclado, notas multilínea, selectores/opciones nuevas, reversión y una escritura por lote.
- [x] Verificar filtros que dejan de coincidir, borradores de filas ocultas, temas, móvil y reconciliación de conflictos/respuestas perdidas.
- [x] Ejecutar regresión proporcional de 004 y verificar Excel intacto, identidad estable y paquete sin archivos privados.
- [x] Actualizar documentación, evidencia y Memories.md; presentar resultado local para revisión del usuario.

Depende de 5. Resultado: entrega local revisable. No ejecutar tests en producción, crear recursos remotos, publicar ni hacer push sin autorización.

## Evidencia de entrega
API D1 local: campos parciales/combinados, null, nombre obligatorio, límites 50/2.000 por puntos de código Unicode, valores nuevos/canónicos, UUID estable y lote mixto atómico con concurrencia. Pruebas restauran datos de partida y avanzan versiones. Chrome local: cursor y teclado, nombres fuera del filtro visibles hasta guardar, selector nuevo, notas multilínea como texto literal, un PATCH por lote, recarga, conflictos y respuesta perdida, temas y móvil. Excel intacto; no migración, reimportación ni cambios en producción.

Límite de cuerpo 3 MiB para cubrir 203 registros con máximos de texto y escapes JSON. Normalización reutiliza opciones de la lectura y del propio lote; sin tabla independiente no impone unicidad global de opciones creadas simultáneamente en filas distintas. No se han probado lectores de pantalla reales ni todos los navegadores.
