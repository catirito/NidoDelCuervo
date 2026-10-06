# Bug assess — memoria con estados contradictorios

Fecha: 6 de octubre de 2026. Clasificación: defecto documental confirmado.

## Método y cronología
Aplicación manual del flujo assess → fix → test de [Spec Kit](https://github.github.io/spec-kit/guides/bugfix.html), sin instalar ni ejecutar su extensión. Los nombres oficiales de los informes son assessment.md, fix.md y test.md. La investigación y la aprobación del diagnóstico ocurrieron en la conversación antes de la corrección; este informe se formaliza después por petición del usuario. No se presenta como un archivo creado antes de editar.

## Síntoma y reproducción
Base anterior recuperable: commit 14306d7. Ejecutar desde la raíz:

```sh
git show 14306d7:Memories.md
```

En esa versión, comparar:
- Línea 42: Excel presentado como única fuente de datos.
- Líneas 24–26: transición a D1 y edición compartida.
- Línea 119: publicación mediante characters.json y lectura del Excel descrita como vigente.
- Línea 195: última entrega publicada e integrada, mientras el inicio y otros apartados conservan etapas previas.

Contrastar con README.md, server/query.js, scripts/build-cloudflare.mjs, wrangler.production.jsonc y la evidencia final de specs/010-eliminar-personajes/tasks.md. El resultado es una memoria que obliga a reconstruir la cronología para resolver afirmaciones incompatibles.

## Resultado esperado
Una síntesis vigente que identifique D1 como fuente activa, Excel como histórico privado, publicación documentada más reciente, alcance autorizado y enlaces al detalle. Las decisiones sustituidas permanecen recuperables en Git, sin un archivo histórico adicional.

## Causa sustentada y límites
Las actualizaciones acumularon decisiones nuevas sin sustituir las antiguas. AGENTS.md ya exigía actualizar la memoria y evitar un diario. Es un fallo observable de mantenimiento y comprobación, no falta de instrucciones del usuario. No se afirma conocer la causa interna del comportamiento del modelo.

## Corrección aprobada
Modificar únicamente AGENTS.md y Memories.md como documentación de proyecto: concretar el cierre documental y sintetizar el estado actual. No cambiar código, Excel, D1, herramientas, publicación o especificaciones funcionales. Crear estos tres informes como ejemplo docente solicitado. La corrección se preparó inicialmente sin autorización de entrega Git; tras revisarla, el usuario autorizó commit, merge y push separados del bug. La nueva propuesta sobre proporcionalidad queda fuera.

## Criterios de aceptación
1. La reproducción histórica demuestra la contradicción anterior; la memoria actual la elimina.
2. D1, exportación, catálogos, alta, eliminación y publicación concuerdan con los archivos y evidencias consultados.
3. El estado actual no presenta como pendientes las entregas integradas; distingue evidencia previa de nueva validación remota.
4. Las instrucciones exigen sustituir afirmaciones obsoletas y revisar coherencia.
5. Los enlaces locales principales existen y el cambio queda limitado a documentación.
6. Los estados antiguos detectados en otros documentos quedan identificados como pendientes, sin fingir una limpieza de todo el repositorio.

## Ejercicio de aprendizaje
Localizar qué afirmación cambia, explicar por qué es incorrecta y señalar la evidencia que establece el estado vigente antes de leer fix.md.
