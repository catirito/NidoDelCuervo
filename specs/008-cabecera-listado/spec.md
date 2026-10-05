# 008 — Distribución de la cabecera del listado

Estado: especificación, plan y tareas autorizados y preparados. Implementación autorizada y completada; revisión local realizada, evidencia en tasks.md. Rama local y GitHub: `codex/008-cabecera-listado`, creada desde main antes de escribir documentos.

## Problema y objetivo
El texto «1–50 de 203 coincidencias · 203 personajes» comparte la barra con «El elenco», «Exportar Excel» y «Editar». Su longitud ocupa espacio y desplaza los botones. Separar información y acciones para que el contador no intervenga en la distribución de esa barra.

## Alcance confirmado
- Primera fila: «El elenco» a la izquierda y las acciones existentes a la derecha.
- Mover el contador a una línea propia, alineada a la izquierda, justo antes de la tabla y después de la ayuda de ordenación.
- Mantener el estilo discreto del contador y sus textos dinámicos actuales.
- En móvil, el contador conserva su línea independiente y permite envolver texto dentro del ancho disponible. Los botones pueden acomodarse al espacio de su barra, sin competir con el contador.
- Conservar mensajes de carga, error y totales, y la región accesible que anuncia cambios.
- Conservar las funciones de búsqueda, filtros, ordenación, paginación, edición y exportación.

## Criterios de aceptación
1. El contador ya no pertenece a la barra de título/acciones ni desplaza sus botones.
2. Se muestra debajo de la ayuda y antes de la tabla, en su propia línea, en escritorio y móvil.
3. Mantiene contenido y actualizaciones de carga, consulta, filtros, cambios de página y cero resultados.
4. Mantiene id, role=status, aria-live=polite y aria-atomic=true.
5. Funciona visualmente en temas claro/oscuro, sin desbordamiento de la cabecera a 390 y 320 px y con foco de los botones visible.

## Fuera de alcance
Cambios de datos, API, comportamiento de las acciones, contenido del contador, dependencias, rediseño general y despliegue.

## Próxima etapa
Revisión del usuario en local; commit, push de implementación, merge y publicación pendientes de autorización.

## Entrega aprobada
El usuario aprueba el resultado local y autoriza integrarlo en main. Crear commit y merge locales; publicación expresamente aplazada, sin push ni despliegue en esta entrega.
