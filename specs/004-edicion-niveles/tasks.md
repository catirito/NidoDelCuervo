# Tareas — edición de niveles

Estado: implementación y commit local autorizados, sin push; tareas 1–6 implementadas y validadas en local. Tarea 7 aplazada por la entrega exclusivamente local. Rama: `codex/004-edicion-niveles`. Alcance exclusivo de 004; no implementar 005/006 ni integrar en `main`.

Referencias: `spec.md` y `plan.md` de esta carpeta. Guardado atómico confirmado. Validar exclusivamente fuera de producción.

## 1. Revisar el boceto de edición
- [x] Preparar un sketch separado de la aplicación real, conservando el diseño actual.
- [x] Mostrar consulta y edición: «Editar», menos/nivel/más, rango previsualizado, cambios pendientes y «Guardar».
- [x] Mostrar límites 1–20, controles durante guardado y presentación móvil accesible.
- [x] Revisar el diseño con el usuario antes de implementar los controles.

Resultado: boceto en `sketch/index.html`, con capturas `sketch/consulta.png`, `sketch/edicion.png` y `sketch/movil.png`. Chrome local muestra 203 filas y dos cambios simulados sin errores JavaScript. Guardar es una simulación sin API; filtros y ordenación no están conectados en este boceto. Diseño compacto aprobado por el usuario; límites y estado de guardado comprobados en la implementación local. No se ha modificado producción.

## 2. Preparar esquema e importación local
- [x] Comprobar tipos y vacíos reales de los nueve campos del Excel, sin modificarlo.
- [x] Definir migración de `characters` con nueve campos, UUID v4 como texto, `sourceRow` y `version`; imponer nivel entero 1–20.
- [x] Definir una función de rango por umbrales compartida donde sea apropiado, manteniendo el cálculo autoritativo en servidor.
- [x] Crear importación inicial que preserve ocho campos y vacíos, derive rango y genere UUID una sola vez.
- [x] Rechazar importación en una base ya poblada y separar importación de despliegue.
- [x] Verificar en D1 local los 203 registros, ocho campos intactos, rangos corregidos, identidades únicas y orden de origen; comprobar hash del Excel.

Resultado: base local reproducible e importación fiel salvo rango derivado, sin recursos remotos todavía.

## 3. Implementar lectura y guardado atómico
- [x] Configurar Pages Functions y binding D1 de servidor para desarrollo local.
- [x] Implementar `GET /api/characters` con los nueve campos, UUID, fila y versión; distinguir fallo de servicio de lista vacía.
- [x] Implementar validación de `PATCH /api/characters/batch`: cuerpo y lote acotados, UUID válidos/únicos/existentes, versión y solo `fields.NIVEL` entero 1–20.
- [x] Implementar escritura preparada que condicione todo el lote a las versiones esperadas, sin ventana de concurrencia ni actualizaciones parciales.
- [x] Calcular rango y avanzar versión en la misma operación; devolver registros resultantes.
- [x] Devolver errores de formato, inexistencia, conflicto, nivel inválido y servicio según el contrato del plan.
- [x] Añadir respuestas sin caché y noindex; mantener mismo origen sin sesiones, credenciales en navegador ni CORS de escritura externo.
- [x] Probar localmente lotes válidos, campos ajenos, duplicados, límites, umbrales, versiones obsoletas y ausencia de escrituras parciales, incluidos dos clientes concurrentes.

Depende de 2. Resultado: contrato de dos endpoints comprobado con D1 local.

## 4. Conectar consulta y borrador local
- [x] Sustituir la consulta de datos por la API conservando búsqueda, filtros, temas y desempates por `sourceRow`.
- [x] Mantener snapshot de niveles/versiones y mapa de cambios por UUID.
- [x] Aplicar menos/más en pasos de uno, limitar 1–20 y previsualizar rango; permitir múltiples personajes y pulsaciones sin escrituras.
- [x] Retirar del lote cambios revertidos al valor original.
- [x] Implementar el boceto revisado en HTML, CSS y JavaScript separados, con teclado, foco visible y móvil.

Depende de 1 y 3. Resultado: edición visible exclusivamente local hasta «Guardar».

## 5. Integrar guardado y recuperación
- [x] Enviar una sola petición con personajes modificados, nivel final y versión esperada; si no hay cambios, volver a consulta sin escribir.
- [x] Bloquear modificaciones y envíos duplicados mientras se guarda.
- [x] Incorporar respuesta y nuevas versiones, limpiar borrador y volver a consulta conservando filtros, tema y foco predecible.
- [x] Ante conflicto, identificar afectados y conservar borrador para actualizar/reconciliar; no sobrescribir ni reintentar automáticamente.
- [x] Ante error de red, reconciliar lectura y versiones antes de repetir una escritura cuyo resultado sea incierto.
- [x] Informar errores sin falso éxito y documentar pérdida de borrador al recargar.

Depende de 4. Resultado: guardado completo o ninguno y recuperación sin pérdida silenciosa.

## 6. Validar y documentar la entrega local
- [x] Ejecutar verificaciones significativas de importación, API, concurrencia y atomicidad fuera de producción.
- [x] Verificar en navegador local: varios personajes, salto de cinco niveles, cambios revertidos, una sola escritura, errores, teclado y móvil.
- [x] Comprobar regresión de consulta y temas, Excel intacto y ausencia del libro/documentación en el paquete público.
- [x] Actualizar documentación y `AGENTS.md` para distinguir D1 activo y Excel histórico, con autorización de implementación.
- [x] Documentar Time Travel de siete días, recuperación inicial desde Excel y limitaciones; ubicación de copia privada adicional pendiente, sin añadir R2.
- [x] Presentar resultado local y evidencia al usuario antes de solicitar publicación.

Depende de 5. Resultado: entrega local revisable, con límites y comprobaciones documentados.

## 7. Crear recursos y publicar cuando se autorice
- [ ] Comprobar cuotas gratuitas y crear/conectar D1 con autorización; aplicar migración e importar una sola vez.
- [ ] Preparar paquete Pages/Functions para el proyecto existente, conservando robots y cabeceras; excluir Excel, SQL y documentación.
- [ ] Desplegar sin reimportar ni reemplazar datos y comprobar únicamente el estado del despliegue remoto.
- [ ] Registrar evidencia, recursos y procedimiento de futuras publicaciones; no ejecutar tests en producción ni integrar en `main`.

Depende de 6 y autorización expresa de recursos/publicación. Resultado: misma URL con D1 como fuente activa, sin ampliar el alcance.

## Evidencia y límites de entrega
D1 local: 203 registros, ocho campos conservados y rango derivado; hash original intacto. Segunda importación rechazada. API: niveles inválidos, campos extra, UUID/duplicados, inexistencia, conflicto sin escrituras parciales, dos clientes simultáneos, umbrales en ambos sentidos y cabeceras comprobados. Chrome local: varios personajes, cinco pulsaciones sin escribir, reversión, un PATCH al guardar, recarga, conflicto y respuesta perdida, teclado, filtros, tema y móvil. Niveles iniciales restaurados; las versiones locales reflejan las pruebas. Sin tests en producción ni despliegue.

La copia privada adicional del Excel no tiene destino acordado. Time Travel se documenta para futura D1 remota; no existe en la simulación local. No se han probado lectores de pantalla reales ni todos los navegadores. Evidencia visual en `local-edicion.png` y `local-movil.png`.
