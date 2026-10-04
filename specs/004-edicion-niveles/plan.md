# Plan — edición de niveles

Estado: planificación revisada; creación de tareas autorizada. El usuario aprueba el paso uno y modifica importación, API y guardado. Implementación y commit local autorizados; recursos remotos y publicación aplazados. Rama: `codex/004-edicion-niveles`; sin integración en `main`.

## 1. Web, base de datos y estructura
Mantener HTML/CSS/JavaScript en Pages y añadir Pages Functions solo para `/api/*`, con un binding D1 de servidor. Sin frameworks ni servidor permanente. D1 sustituye la copia JSON como fuente activa. Consulta, búsqueda, filtros, ordenación y temas mantienen su comportamiento.

Tabla `characters`: nueve campos del registro, identificador estable `id` de tipo UUID v4 almacenado como texto, fila original `sourceRow` y contador `version`. Comprobar tipos reales antes de fijar las columnas, sin convertir vacíos o valores silenciosamente. `NIVEL` entero 1–20. No usar nombres ni índices visibles como identidad. No hay tabla de sesiones.

## 2. Importación e histórico
Reutilizar XLSX y `readCharacters` existentes. Importar solo los registros de la hoja principal; conservar ocho campos y sus vacíos/resultados guardados. Calcular `RANGO` desde `NIVEL` usando los nombres de la especificación. Se encontraron tres rangos incorrectos ignorando mayúsculas; corregirlos y registrar un resumen de diferencias. No recalcular ni modificar el Excel.

Generar UUID v4 una sola vez durante la importación y conservarlos en D1; no regenerarlos al guardar o publicar. Asignar identificadores una vez y preservar `sourceRow` para desempates. Comparar los 203 registros campo por campo; para rango, comparar con el resultado de la regla. Importar solo a una base vacía y rechazar una ya importada. La publicación no reimporta ni reemplaza registros.

Conservar Excel local y hash como histórico inicial, sin publicarlo. Ubicación de copia adicional privada en Cloudflare pendiente; no añadir R2 todavía. D1 Free dispone de Time Travel automático de siete días sin coste adicional para cambios posteriores; documentar límites y procedimiento, sin restauraciones destructivas no autorizadas. Al implementar, actualizar `AGENTS.md` para distinguir D1 activo del Excel histórico.

## 3. API: dos endpoints para 004
Sin contraseña, cookies de sesión ni endpoints de autorización, por decisión expresa del usuario. Mantener validación de datos y control de concurrencia. El modo de edición no protege la API pública; no colocar credenciales de D1 en el navegador.

### GET /api/characters
Público, sin parámetros. Devuelve 200 con `{ characters: [...] }`. En 004 no devuelve ni importa catálogos adicionales. Cada elemento incluye los nueve campos, `id`, `sourceRow` y `version`, en orden de origen. Error de servicio 503; no devolver una lista vacía que aparente éxito.

### PATCH /api/characters/batch
Recibe un lote con solo los campos modificados de cada personaje, no incrementos por pulsación:

```json
{
  "changes": [
    { "id": "7e5bc9ee-1253-4a0c-9ed4-0354dceff0ad", "expectedVersion": 0, "fields": { "NIVEL": 8 } },
    { "id": "bd260cce-b707-4140-a2be-9d2a0651cab1", "expectedVersion": 2, "fields": { "NIVEL": 5 } }
  ]
}
```

Ejemplo ilustrativo, no datos reales ni cambios autorizados. Solo incluir personajes y campos cuyos valores finales difieren del snapshot inicial. Una edición puede subir o bajar varios niveles antes de guardar; el servidor no limita la diferencia a uno.

Validar estructura, tamaño acotado del lote/cuerpo, UUID v4 válidos, únicos y existentes, versiones enteras y niveles enteros 1–20. En 004 permitir exclusivamente `NIVEL` en `fields`; rechazar cualquier otro campo, incluido rango manual. El formato `fields` permite revisar extensiones cuando se retomen 005/006, sin implementarlas ahora. Calcular rango en servidor cuando cambie el nivel, conservando el resto de campos no enviados. Usar SQL preparado con parámetros enlazados; no concatenar valores recibidos.

Decisión confirmada: operación atómica de lote, todos o ninguno. Validación y comprobación de versiones deben condicionar conjuntamente la escritura, sin una ventana entre consultar y actualizar. Evaluar una única sentencia SQLite que actualice el conjunto solo si todas las versiones coinciden; verificar ese mecanismo con D1 local antes de publicarlo. No basta ejecutar actualizaciones condicionales independientes en un batch, porque podrían guardarse solo algunas.

Respuesta 200 con `{ characters: [...] }` para los registros resultantes y sus nuevas versiones. 400 para formato/duplicados/campos inválidos; 404 si falta un personaje; 409 para versión obsoleta, con identificadores en conflicto y sin cambios del lote; 422 para niveles inválidos; 503 para fallo de servicio. Errores con `{ error: { code, message } }`, sin datos internos. No hay escrituras por personaje ni POST/GET/DELETE de sesión.

Responder sin caché y con `X-Robots-Tag: noindex, nofollow, noarchive`. Mantener rutas de escritura en el mismo origen y no habilitar CORS de escritura para otros sitios; esto no sustituye autenticación y no impide llamadas directas. No añadir altas, borrados, importación pública ni edición de campos ajenos al alcance confirmado.

## 4. Borrador, controles y guardado de niveles
«Editar» activa el modo local sin pedir clave. Guardar un snapshot de campos/versiones y un mapa de cambios por UUID y campo. Cada menos/más modifica el nivel local en uno dentro de 1–20 y previsualiza el rango derivado. Cambiar varios personajes o repetir pulsaciones no llama a la API. Volver al valor original retira ese campo del mapa; si no quedan campos modificados, retira el personaje.

«Guardar» envía una sola petición PATCH con la lista de UUID, versiones y campos modificados. Sin cambios, no realizar una escritura; volver a consulta. Durante el envío deshabilitar controles y guardar para evitar duplicados. Tras éxito, incorporar registros/versiones del servidor, limpiar el borrador y volver a consulta. Reaplicar ordenación y filtros preservando tema y foco.

Si hay conflicto, conservar el borrador, informar los personajes afectados y permitir actualizar la lectura antes de volver a guardar; no pisar datos ni reintentar automáticamente. Diseñar esa recuperación sin perder cambios silenciosamente. En un fallo de red, la escritura puede haberse completado: consultar versiones para reconciliar antes de repetir el lote.

Los cambios pendientes se distinguen de los guardados. Los controles tienen nombres accesibles y foco visible; bloquear bajar en 1 y subir en 20. No añadir un botón «Salir de edición», sesiones ni pantallas de contraseña. Presentar un sketch separado de la aplicación real para revisar ubicación y aspecto. Recargar antes de guardar pierde el borrador; no prometer persistencia local adicional.

## 5. Validación y publicación posterior
Probar con D1 local y datos de prueba: escritura exclusivamente de nivel y rechazo de otros campos, importación fiel salvo rango derivado, hash del Excel, nombres duplicados, umbrales de rango en ambos sentidos, límites y valores inválidos, lote múltiple, identidad duplicada, conflictos y atomicidad. Verificar que dos clientes no se pisan, incluido nivel que vuelve a su valor previo.

Regresión local de consulta, tema, teclado y móvil; ninguna escritura antes de guardar, una sola petición por lote, retirada de cambios revertidos y recuperación de errores. No ejecutar tests en producción.

Cuando se autorice publicar, conservar proyecto/URL Pages, empaquetar Functions con Wrangler y conectar D1. No publicar Excel, SQL, copias ni documentación. Conservar robots/cabeceras estáticas y noindex explícito en API, porque `_headers` no se aplica a Functions. No reimportar durante despliegue. Evidencia remota limitada al estado de despliegue; funcionalidad validada fuera de producción.

Mantener planes gratuitos y comprobar cuotas antes de crear recursos. Coste esperado cero dentro de cuotas para el uso acordado; superarlas puede bloquear consultas. No activar servicios de pago ni nuevos backups programados.

## Alcance pospuesto
Nombre, notas y estado se conservan en `specs/005-edicion-datos-personajes/spec.md`. Clase, subclase y especie, catálogos y valores nuevos se conservan en `specs/006-edicion-catalogos/spec.md`. No desarrollar sus controles, validaciones de escritura ni tablas por adelantado.

La ubicación de una copia privada adicional del Excel continúa pendiente; el sketch compacto está aprobado; el original local se conserva. La atomicidad del lote completo está confirmada.

## Fuentes y siguiente etapa
[D1 desde Pages](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases), [precios](https://developers.cloudflare.com/d1/platform/pricing/), [límites](https://developers.cloudflare.com/d1/platform/limits/), [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) y [cabeceras](https://developers.cloudflare.com/pages/configuration/headers/).

Tareas 1–6 implementadas y validadas en local en `tasks.md`; revisión del resultado por el usuario pendiente. Implementación y validación local completadas; no se han creado recursos remotos ni publicado esta funcionalidad.

## Ajuste visual confirmado del boceto
Editar y Guardar compactos, fondo gris oscuro y borde púrpura; relleno púrpura intenso solo en hover. Nivel a la izquierda y botones pequeños a su derecha, más arriba y menos abajo. Boceto compacto aprobado e implementado en local.
