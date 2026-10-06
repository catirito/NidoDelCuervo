# Bug fix — memoria con estados contradictorios

Fecha: 6 de octubre de 2026. Corrección documental aplicada y revisada por el usuario; commit, merge y push autorizados.

## Cambios realizados
- AGENTS.md: precisa que la memoria contiene estado vigente y motivos relevantes; exige sustituir afirmaciones obsoletas, revisar coherencia y comunicar contradicciones pendientes. Git conserva versiones anteriores; no se crea un histórico paralelo.
- Memories.md: sustituye la cronología acumulativa por estado actual, arquitectura/datos, comportamiento esencial, mapa de especificaciones, entorno/publicación, validación y pendientes.
- D1 queda identificada como fuente activa y Excel como histórico privado. Se retiran instrucciones obsoletas de lectura directa, snapshot JSON, destino Sites y etapas superadas.
- Se conserva información necesaria para no perder decisiones: escritura pública autorizada, catálogos completos, guardados atómicos, exportación de todos los activos y separación entre rama Git y referencia de producción de Pages.
- La última publicación se presenta como evidencia documentada, no como comprobación remota nueva.

## Desviaciones y alcance
El usuario pidió formalizar este ejemplo después de aplicada la limpieza. Por eso los informes se redactan retrospectivamente; el diagnóstico y su aprobación sí precedieron a la corrección en la conversación. No se instalaron ni ejecutaron comandos de Spec Kit.

No se modificaron specs antiguas con estados pendientes: la memoria identifica esa deuda documental. Tampoco se implementó la mejora propuesta del entorno de pruebas. Esta corrección no equivale a una auditoría de coherencia total del repositorio.

La entrega se aísla en `codex/fix-memoria-estado-vigente`, creada después de la corrección local y antes del commit. No incluye la propuesta aún no aprobada de instrucciones sobre proporcionalidad ni despliegue.

## Cómo revisar
Comparar los cambios de AGENTS.md y Memories.md con Git y leer test.md. El contenido anterior continúa disponible en 14306d7; no hace falta un segundo archivo histórico.

## Ejercicio de aprendizaje
Explicar qué datos se conservan en la memoria porque afectan a la próxima tarea y cuáles se recuperan desde Git porque solo describen el pasado.
