# Guía del proyecto

## Objetivo y tecnologías
- Desarrollar paso a paso una web simple con HTML, CSS y JavaScript, sin frameworks.
- Limitar cada cambio a la tarea actual. No añadir dependencias, herramientas ni funciones de producto sin haberlas acordado.
- Seguir el flujo del curso: constitución → especificación → clarificación → planificación → tareas → implementación → validación. Consultar la etapa actual en `Memories.md` y limitar el trabajo a la etapa autorizada por el usuario.
- Consultar `.agents/skills/frontend-skill/SKILL.md` cuando la tarea requiera diseño visual, adaptando su orientación a las tecnologías y límites acordados.

## Fuente de datos y límites
- `Registro de personajes.xlsx`, situado en la raíz, es la fuente de importación inicial y el histórico de solo lectura. No modificarlo ni publicarlo. Para la especificación 004, D1 es la fuente activa de consulta y edición después de importar; no reimportar en cada despliegue.
- No inventar datos ausentes ni asumir nombres de columnas o estructuras sin comprobar el fichero.

## Colaboración orientada al aprendizaje
- Explicar brevemente los motivos y los cambios para ayudar al usuario a aprender buenas prácticas de desarrollo con IA.
- Trabajar con cambios pequeños y delimitados. Preguntar cuando exista una ambigüedad real sobre una decisión que afecte al comportamiento.
- Antes de abordar un cambio, valorar la claridad del resultado esperado, las partes afectadas, las consecuencias de un error y la verificación necesaria. Proponer brevemente un proceso proporcional: corrección acotada, mejora documental o desarrollo guiado por especificaciones, explicando el motivo. Respetar la etapa y el proceso ya autorizados; cualquier simplificación del flujo del curso debe acordarse con el usuario. No repetir el análisis ni pedir otra confirmación cuando el alcance y el proceso ya estén acordados, salvo que aparezca información que los cambie.
- Usar múltiples agentes cuando el usuario pida practicar ese flujo, con tareas delimitadas y un responsable de integración.

## Código limpio
- Usar nombres descriptivos y consistentes.
- Escribir funciones pequeñas, centradas en una responsabilidad.
- Mantener HTML, CSS y JavaScript en archivos separados: HTML para estructura, CSS para presentación y JavaScript para lógica. No incrustar estilos ni scripts en el HTML.
- Evitar duplicación y crear abstracciones cuando exista una necesidad real, sin sobreingeniería.
- No añadir comentarios en HTML, CSS o JavaScript; expresar la intención mediante nombres claros y estructura, y documentar motivos o decisiones en la documentación del proyecto, fuera del código.

## Calidad y verificación proporcional
- Usar HTML semántico y cuidar la accesibilidad y la adaptación a móvil.
- Comprobar el comportamiento afectado con una verificación proporcional al cambio. Informar qué se comprobó y las limitaciones.
- No inventar comandos de ejecución o pruebas; usar los que se hayan establecido en el proyecto.

## Flujo de Git por especificación
- Cada nueva especificación debe tener su propia rama de Git, creada antes de escribir o modificar sus documentos. Usar un nombre vinculado a su número y propósito, como `codex/002-diseno-visual`.
- Trabajar en esa rama durante especificación, clarificación, planificación, tareas, implementación y validación; comprobar la rama activa al retomar la especificación.
- Crear también la rama correspondiente en GitHub y mantener el trabajo de la especificación separado de `main`. No integrar en `main` sin autorización del usuario.

## Documentación
- Organizar cada funcionalidad dentro de `specs/` en una carpeta con número de tres cifras y nombre descriptivo, como `001-registro-personajes/`. Cada carpeta contiene `spec.md`, `plan.md` y `tasks.md`; las rutas citadas parten de la raíz del proyecto.
- Mantener en `AGENTS.md` las reglas estables del proyecto.
- Consultar `Memories.md` al retomar el trabajo o iniciar una tarea que dependa de decisiones del proyecto.
- Mantener `Memories.md` como una síntesis breve del estado vigente: etapa y alcance autorizados, decisiones confirmadas y sus motivos relevantes, dudas pendientes y enlaces a los documentos necesarios para continuar. No convertirlo en un diario ni duplicar las reglas de `AGENTS.md` o el detalle de las especificaciones.
- Actualizar `Memories.md` cuando cambie una decisión relevante o el estado del trabajo. Sustituir las afirmaciones obsoletas en lugar de acumular estados anteriores, conservando los motivos que sigan siendo útiles. Git conserva las versiones anteriores; no mantener un archivo histórico paralelo.
- Antes de cerrar una tarea, el agente debe comprobar la coherencia de las decisiones y estados afectados entre `Memories.md`, la especificación, el plan y las tareas. Buscar y corregir las referencias que aún presenten una decisión sustituida como vigente; distinguir lo propuesto, autorizado, implementado, validado y publicado sin declarar avances sin evidencia.
- Informar brevemente de la documentación actualizada y de cualquier contradicción que no pueda resolverse con la evidencia disponible.
