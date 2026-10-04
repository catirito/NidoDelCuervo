# Nido del Cuervo — edición de nombre, notas, estado y propietario

Estado: planificación autorizada y elaborada para revisión; clarificaciones pendientes indicadas en el plan. Implementación completada y validada en local; commit autorizado, sin push ni publicación. Rama local y GitHub: `codex/005-edicion-datos-personajes`, creada antes de escribir estos documentos. Sin integración en `main`.

## Objetivo
Ampliar la edición de personajes con `PERSONAJE`, `NOTAS`, `ESTADO` y `PROPIETARIO`, reutilizando D1, UUID y el guardado por lotes de la especificación 004.

## Decisiones conservadas
- Permitir cambiar nombre, notas, estado y propietario de varios personajes en un borrador local.
- Una sola petición al pulsar «Guardar», con los registros y campos modificados, sin escritura por pulsación.
- Propietario permanece en la misma tabla de personajes, sin entidad ni relación adicional, confirmado por el usuario.
- Propietario usa un selector con los valores existentes en los registros y una opción para escribir un propietario nuevo. El cambio queda en el borrador y se guarda en el mismo lote; no hay escritura al añadir la opción. Tras guardar, el propietario nuevo aparece entre los valores disponibles.
- Si un cambio deja una fila fuera del filtro activo, mantenerla visible durante la edición y reaplicar filtros tras Guardar, confirmado por el usuario.
- Estado y propietario: quitar espacios exteriores; si el texto coincide con un valor existente salvo mayúsculas, reutilizar su grafía. No fusionar ni reescribir otras filas.
- Máximo 50 caracteres en nombre, estado y propietario; máximo 2.000 en notas, confirmado por el usuario.
- Nombre obligatorio; notas, estado y propietario admiten vacío, confirmado por el usuario.
- Estado usa selector con los valores existentes, «Sin estado» y opción de introducir un estado nuevo, confirmado por el usuario. Se guarda en el mismo lote y luego aparece entre las opciones; no crear una tabla de estados.
- Mantener consulta y edición sin contraseña ni cuentas, de acuerdo con la decisión vigente de 004.
- Conservar UUID estable aunque cambie el nombre; no usar nombres como clave.
- No modificar el Excel histórico ni crear/borrar personajes.
- Mantener niveles/rangos de 004, consulta, filtros, temas, accesibilidad y móvil.
- Detectar conflictos sin sobrescribir otras ediciones. Plan gratuito; sin tests en producción.

## Dependencia
Se trabaja después de la entrega de 004. La rama local parte de la implementación validada de 004. Reutilizar GET /api/characters y PATCH /api/characters/batch, con UUID, expectedVersion y fields; ampliar solo los campos autorizados y conservar atomicidad del lote.

## Clarificación pendiente para cuando se retome
- Comprobar en implementación normalización de estado/propietario conforme a la regla confirmada, sin crear catálogos adicionales.
- Diseño de controles aprobado en el boceto: nombre como input, notas como textarea, estado/propietario como selectores con input debajo al añadir una opción; conservar niveles compactos.
- Normalización de textos pendiente; preservar vacíos existentes sin inventar valores.
- Contrato para enviar solo los campos cambiados y validación en servidor.
- Concretar implementación de errores, foco y conflictos conforme al plan.

## Criterios de aceptación preliminares
1. Editar nombre, notas, estado y propietario y guardar con una sola petición junto con los cambios del lote.
2. Conservar UUID y campos no editados; no confundir personajes de nombre repetido.
3. Persistir y consultar los cambios sin publicar de nuevo.
4. Rechazar campos fuera del alcance y entradas inválidas según las reglas que se acuerden.
5. Seleccionar un propietario existente o introducir uno nuevo; conservar el cambio y disponer del nuevo valor después de guardar y recargar.
6. Mantener el funcionamiento de 004 y validar fuera de producción.

## Fuera de alcance
Clase, subclase y especie pertenecen a 006; altas/bajas, rango manual, cuentas y sincronización con Excel no están incluidos.

## Próxima etapa
Revisar `plan.md` y resolver sus propuestas de comportamiento antes de autorizar tareas. Implementación local completada; no publicar.

## Fuente comprobada al retomar
ESTADO contiene Trotamundos, Jubilado, Muerto o vacío. Ningún nombre está vacío; longitud máxima actual de nombre 38 y de notas 27 caracteres. Son observaciones de la fuente, no límites de edición acordados.

## Diseño aprobado
El usuario aprueba el boceto de `sketch/index.html`: edición en las celdas, nombre con input y notas con textarea, selectores de estado/propietario con campo adicional debajo al elegir opción nueva, controles compactos de nivel y Editar/Guardar. Tareas e implementación autorizadas posteriormente y completadas.
