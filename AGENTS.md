# Guía del proyecto

## Objetivo y tecnologías
- Desarrollar paso a paso una web simple con HTML, CSS y JavaScript, sin frameworks.
- Limitar cada cambio a la tarea actual. No añadir dependencias, herramientas ni funciones de producto sin haberlas acordado.
- Seguir el flujo del curso: constitución → especificación → clarificación → planificación → tareas → implementación → validación. Consultar la etapa actual en `Memories.md` y limitar el trabajo a la etapa autorizada por el usuario.
- Consultar `.agents/skills/frontend-skill/SKILL.md` cuando la tarea requiera diseño visual, adaptando su orientación a las tecnologías y límites acordados.

## Fuente de datos y límites
- `Registro de personajes.xlsx`, situado en la raíz, es la única fuente de datos y es exclusivamente de lectura. No modificarlo.
- No inventar datos ausentes ni asumir nombres de columnas o estructuras sin comprobar el fichero.

## Colaboración orientada al aprendizaje
- Explicar brevemente los motivos y los cambios para ayudar al usuario a aprender buenas prácticas de desarrollo con IA.
- Trabajar con cambios pequeños y delimitados. Preguntar cuando exista una ambigüedad real sobre una decisión que afecte al comportamiento.
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

## Documentación
- Mantener en `AGENTS.md` las reglas estables del proyecto.
- Consultar `Memories.md` al retomar el trabajo o iniciar una tarea que dependa de decisiones del proyecto.
- Actualizar `Memories.md` cuando se confirme o cambie una decisión relevante, distinguiendo decisiones confirmadas de pendientes. Evitar un diario de acciones y no duplicar las reglas de `AGENTS.md`.
