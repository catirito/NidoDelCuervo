# 007 — Paginación del registro

## Objetivo
Paginar la tabla mediante consultas a la API, sin cargar todos los personajes para filtrar u ordenar. Los filtros y la búsqueda operan sobre toda la base D1 antes de seleccionar la página.

## Requisitos confirmados
- Primera carga: 50 personajes en escritorio y 20 en móvil.
- Selector de tamaño de página en una esquina inferior de la tabla.
- Consultar al servidor al cambiar página, filtros, búsqueda, orden o tamaño.
- Mantener búsqueda por nombre, filtros combinados y ordenación actuales sobre todo el registro.
- Mantener edición por lotes, UUID, control de versiones y guardado atómico.
- No reimportar Excel ni datos al desplegar.

## Comportamiento concretado en el plan aprobado
- Paginador debajo de la tabla; selector en la esquina inferior derecha, botones anterior/siguiente e indicador de página y total de coincidencias.
- Opciones de tamaño confirmadas: 20, 50, 100 y Todos. Todos consulta todas las coincidencias al servidor con los filtros y orden activos.
- Usar el punto de adaptación móvil existente para decidir el tamaño inicial. Un cambio manual de tamaño tendrá prioridad durante la visita.
- Cambiar criterios o tamaño vuelve a la primera página; una página que queda fuera del total tras guardar se ajusta a la última válida.
- Confirmado: conservar borradores al cambiar de página y guardarlos todos juntos, incluidos personajes fuera de la página visible.
- Opciones de filtros procedentes de toda la base, aunque no estén en la página cargada. Conservar catálogos completos para edición.
- Estados claros de carga, error y cero coincidencias; evitar que respuestas antiguas sustituyan una consulta más reciente.

## Dirección de API implementada
- GET /api/characters acepta page, pageSize, búsqueda, filtros y orden; devuelve characters y metadatos de paginación con total de coincidencias y total del registro.
- SQL aplica WHERE y ORDER BY antes de LIMIT/OFFSET, con parámetros y campos de orden permitidos explícitamente. Desempate estable por sourceRow.
- Obtener opciones globales de filtros y catálogos independientemente de los personajes de la página; contrato concretado en plan.md.
- PATCH /api/characters/batch mantiene el contrato de guardado. La recuperación de conflictos y respuestas perdidas debe consultar los UUID pendientes aunque estén fuera de la página actual; consulta por ids concretada en plan.md.

## Criterios de aceptación
- Un personaje fuera de la primera página aparece al buscarlo o filtrarlo.
- Todas las páginas respetan el orden global y muestran sus totales.
- Defaults de escritorio/móvil y selector funcionan con teclado.
- Filtros muestran valores globales, no solo los de la página.
- Cambios pendientes y recuperación de errores conservan la atomicidad y las versiones.
- Verificación exclusivamente local; sin tests en producción.

## Etapa
Plan, tareas e implementación autorizados. Implementación completada y validada en local. Commit final, push, merge y publicación pendientes de autorización.

## Entrega publicada

Usuario autoriza commit, push y publicación. Commit 6fac87a en codex/007-paginacion; despliegue de producción confirmado por Wrangler en https://03273114.nido-del-cuervo.pages.dev, accesible en https://nido-del-cuervo.pages.dev. Migración 0004 y backfill protegido de 203 nombres completados en D1 remoto; UUID, versiones y campos de personajes conservados. Sin reimportación, tests en producción ni integración en main. Estas decisiones sustituyen las notas anteriores de entrega pendiente.
