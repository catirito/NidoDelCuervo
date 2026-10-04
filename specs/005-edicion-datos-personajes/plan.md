# Plan — edición de nombre, notas, estado y propietario

Estado: planificación autorizada y elaborada para revisión. Las propuestas de validación y de control de estado requieren revisión; tareas autorizadas y desglosadas; implementación autorizada y completada en local. Rama activa: `codex/005-edicion-datos-personajes`, con la implementación local de 004 como base. Sin integración en main, push ni publicación autorizados.

## 1. Mantener esquema y contrato de 004
Reutilizar la tabla `characters` de D1 y sus columnas actuales: `PERSONAJE`, `NOTAS`, `ESTADO` y `PROPIETARIO` ya existen. Propietario permanece como texto en cada personaje, confirmado por el usuario; no crear tabla de propietarios, relaciones ni endpoint de catálogo.

Mantener UUID estable, `sourceRow`, `version`, consulta pública sin autenticación y los dos endpoints existentes. Clase, subclase y especie no se editan hasta 006. Excel histórico intacto; no reimportar, regenerar identidades ni alterar registros al desplegar.

## 2. Ampliar el PATCH parcial y atómico
`GET /api/characters` conserva su respuesta. Los propietarios disponibles se obtienen de los valores no vacíos de `PROPIETARIO` en los registros consultados.

`PATCH /api/characters/batch` admite en `fields` únicamente `NIVEL`, `PERSONAJE`, `NOTAS`, `ESTADO` y `PROPIETARIO`. Puede mezclar cambios de nivel y texto en un mismo personaje o lote. Ejemplo de contrato, con identificador ilustrativo:

```json
{
  "changes": [
    {
      "id": "7e5bc9ee-1253-4a0c-9ed4-0354dceff0ad",
      "expectedVersion": 3,
      "fields": {
        "PERSONAJE": "Nombre revisado",
        "NOTAS": "Nota revisada",
        "PROPIETARIO": "Propietario nuevo"
      }
    }
  ]
}
```

Distinguir campo ausente de campo enviado como vacío/null: omitir conserva el valor, limpiar cambia solo ese campo. Rechazar objetos sin campos, campos desconocidos, tipos incorrectos, UUID duplicados y versiones inválidas. Nunca usar nombre ni propietario como identidad. Escapar por parámetros enlazados y mostrar textos mediante `textContent` o controles de formulario, sin interpretar HTML.

Ampliar la sentencia SQL atómica de 004 para actualizar solo campos presentes en cada elemento. Mantener una única condición que exige coincidencia de todas las versiones antes de escribir cualquier fila; incrementar una vez la versión de cada personaje guardado. Calcular `RANGO` solo al cambiar `NIVEL`; un cambio de nombre, notas, estado o propietario conserva nivel y rango.

Mantener respuesta con personajes actualizados y versiones, errores 400/404/409/422/503, no-store y noindex. Revisar el límite de cuerpo de 004: 64 KiB no admite necesariamente 203 notas extensas. Propuesta: límite de 3 MiB y 203 personajes, lectura acotada y mensaje explícito si se supera; comprobar el máximo real según las longitudes elegidas. No crear escrituras por campo ni reintentos automáticos.

## 3. Controles y validaciones propuestas
Nombre obligatorio y notas/estado/propietario opcionales confirmados. Controles de estado y propietario con opción nueva confirmados. Límites confirmados: 50 caracteres en nombre, estado y propietario, y 2.000 en notas. Normalización y controles de nombre/notas siguen como propuestas para revisar:

| Campo | Control | Vacío y límite propuestos |
| --- | --- | --- |
| PERSONAJE | Input de texto en su celda | Obligatorio, 1–50 caracteres tras quitar espacios exteriores; admitir nombres repetidos |
| NOTAS | Textarea en su celda | Opcional, máximo 2.000 caracteres; permitir saltos de línea y conservar el texto; vacío se guarda como null |
| ESTADO | Selector con «Añadir estado…» y campo de texto asociado, confirmado | Valores existentes y «Sin estado» (null); opción nueva confirmada, máximo 50 caracteres confirmado |
| PROPIETARIO | Selector con «Añadir propietario…» y campo de texto asociado | Opcional («Sin propietario», null), máximo 50 caracteres; quitar espacios exteriores al nuevo valor |

Los límites están confirmados por el usuario; no se deducen de las longitudes actuales del Excel. Aplicar las mismas reglas en cliente y servidor; no cambiar valores existentes durante lectura ni normalizarlos masivamente. La validación no inventa contenido para vacíos.

Propietario nuevo queda en el borrador, asociado al personaje; solo persiste al guardar esa fila. Tras éxito aparece en los selectores de edición y filtro por derivarse de los registros. No hay propietarios independientes sin personaje. Si el último personaje deja de usar un propietario, el valor deja de aparecer después de actualizar el registro: consecuencia de mantenerlo en la misma tabla, a revisar con el usuario.

Regla confirmada para estado y propietario: al introducir texto, quitar espacios exteriores y reutilizar la grafía de un valor existente si coincide sin distinguir mayúsculas. Conservar diferencias de acentos y espacios interiores. No fusionar propietarios ni modificar otras filas automáticamente. Aplicar la misma regla en cliente y servidor; no normalizar masivamente valores históricos.

## 4. Extender el borrador y conservar la experiencia
Generalizar el mapa de cambios de 004 a campos por UUID, con snapshot original y versión. Cada control cambia únicamente el borrador. Revertir cualquier campo lo retira del mapa; si no quedan cambios, retirar el personaje. Guardar envía los campos con diferencia final y una versión por personaje, en un solo lote junto con niveles.

Mantener Editar/Guardar compactos y los controles de nivel aprobados. Nombre, notas, estado y propietario se editan dentro de sus celdas; estado y propietario muestran texto adicional solo cuando se elige añadir. Mostrar estado pendiente por fila y junto a campos relevantes. Reutilizar temas y tabla horizontal móvil, con etiquetas accesibles por campo/personaje, foco visible y validación asociada al control.

Implementar los controles conforme al boceto aprobado cuando se autorice esa etapa. Evitar reconstruir toda la tabla con cada carácter: conservar foco, cursor y composición de texto. Decisión confirmada: si un cambio de campo hace que una fila deje de cumplir búsqueda o filtros, mantenerla visible durante la edición y reaplicar los filtros después de Guardar. No ocultarla al confirmar el campo ni al escribir. Conservar foco y cursor; una modificación explícita de filtros seguirá siendo una acción del usuario, sin descartar el borrador.

Durante guardado bloquear todos los campos editables y envíos repetidos. Tras éxito, incorporar registros del servidor, regenerar valores de propietarios sin perder filtros y volver a consulta. La ordenación y el tema se conservan.

Extender recuperación de conflictos a todos los campos: conservar borrador, consultar última versión y mostrar valor guardado frente a propuesta en campos afectados. Retirar del borrador campos cuyo valor deseado ya esté guardado; mantener los demás para revisión explícita antes de reenvío. No sustituir silenciosamente modificaciones concurrentes ni descartar cambios de otras filas. Mantener reconciliación de respuesta perdida y aviso al recargar con borrador pendiente.

## 5. Validación y entrega local
Pruebas con D1 local: modificaciones parciales de cada campo y combinadas, nivel/rango coherentes, UUID estable con nombre cambiado o repetido, conservación de campos omitidos, null explícito, límites, tipos inválidos, propietario nuevo y atomicidad en conflicto entre cambios de texto/nivel.

Navegador local: escritura con cursor estable y teclado, textarea multilínea, selección y alta de propietario, cambios revertidos, un PATCH por lote, conservación de filtros/temas, móvil y recuperación de conflictos/respuesta perdida. Reutilizar pruebas de 004 y ampliar solo comportamiento nuevo. No ejecutar tests en producción.

Documentar decisiones y evidencia. Presentar la solución local cuando se autorice implementar; commits, push y publicación de 005 requieren su autorización correspondiente. No crear nuevos recursos de Cloudflare ni migraciones de datos innecesarias.

## Decisiones pendientes antes de tareas
Revisar controles de nombre/notas y normalización de textos nuevos; comprobar en el boceto los controles de texto y selección. La visibilidad hasta Guardar de filas que dejan de cumplir filtros está confirmada. La estructura de propietario en `characters`, selector existente y opción de nuevo están confirmados. Estado también usa selector con opción nueva y «Sin estado», confirmado; sus opciones se derivan de los registros, sin tabla adicional.

## Boceto preparado para revisión
Vista separada en `sketch/index.html`, con capturas `sketch/edicion.png`, `sketch/nuevo-propietario.png` y `sketch/movil.png`. Usa datos existentes y no escribe en D1 ni llama a la API de guardado; Guardar simula la salida de edición. Filtros no conectados. Nombre y notas editables dentro de celda; los selectores muestran un input adicional al añadir opción. Chrome local comprobó 203 filas y ausencia de errores JavaScript. Diseño aprobado por el usuario e implementado en local.

## Resultado local
Implementación completada sobre esquema existente, sin migración. Campos parciales, normalización y lote atómico comprobados en D1 local; controles, cursor, filtros, conflictos y móvil comprobados en Chrome. Recuento por puntos de código Unicode y límite de cuerpo 3 MiB. Nombre conserva texto salvo rechazo de vacío; notas conservan saltos de línea. Commit local autorizado, sin push ni publicación.
