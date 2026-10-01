# Nido del Cuervo — plan de diseño visual

Estado: planificación elaborada por autorización del usuario. Tareas desglosadas en `specs/002-diseno-visual/tasks.md`; implementación pendiente. Requisitos: `specs/002-diseno-visual/spec.md`. Rama de trabajo: `codex/002-diseno-visual`.

## Resultado previsto
Una superficie de consulta oscura y compacta, con acentos de oro envejecido, texto hueso y controles de esquinas suaves. Eliminar menú y contador superior para acercar la consulta a la tabla. Conservar la identidad del cuervo y el comportamiento de los registros.

## Composición
Cabecera compacta con cuervo y nombre → título breve del registro → búsqueda y cinco filtros → estado de resultados y tabla. Reducir espacios verticales y textos repetidos en la introducción, conservando orientación suficiente. Sin nuevos bloques, imágenes ni navegación sustitutiva. Mantener el enlace de salto accesible al registro.

## Sistema visual
- Base de trabajo: fondo `#16181D`, superficies `#22252C`, texto `#F2EEE5`, secundario `#BBB7AF`, separadores decorativos `#555963`, acento `#C6A15B` y foco/enlaces `#E7C784`.
- Botones de acento con texto carbón; estados de error identificables por texto y estructura, sin depender solo del color.
- Radios iniciales: 10 px en controles y botones, 14 px en el contorno de la tabla. Ajustes pequeños permitidos para coherencia y revisión visual.
- Evitar bordes pesados por celda; separadores horizontales discretos y jerarquía mediante espaciado y superficies. Los límites esenciales de controles deben tener contraste suficiente.
- Mantener Georgia para identidad y títulos y Arial para controles/datos. No añadir fuentes o dependencias.
- Conservar la silueta del logo. Adaptar su presentación con una superficie hueso detrás para que el cuervo oscuro siga siendo legible, sin redibujarlo.
- Interacciones de foco y hover breves, sin animaciones decorativas; respetar movimiento reducido.

## Cambios por archivo
- `index.html`: retirar la navegación y `registry-count`, compactar la introducción, actualizar el color del navegador y mantener semántica, controles, nueve columnas y estados.
- `styles.css`: sustituir tokens del tema claro, retirar reglas exclusivas del menú/contador, aplicar radios y espaciado compacto; revisar colores fijos, controles nativos, estados, logo y responsive.
- `app.js`: eliminar el selector del contador superior y sus escrituras durante carga y éxito. Mantener el estado de resultados junto a la tabla. Quitar el nodo HTML sin estas referencias provocaría un error: ambas modificaciones deben realizarse juntas.
- `records.js`, biblioteca y Excel: conservar lógica y fuente.
- Documentación: reflejar la nueva presentación y la evidencia de validación, conservando la especificación 001 como antecedente.

## Validación proporcional
- Ejecutar la prueba de datos existente con el Excel real y comprobar su hash original.
- Revisar en Chrome carga, búsqueda, filtros AND, limpieza, ordenación, vacíos, error y recuperación; comprobar ausencia de errores de JavaScript tras retirar el contador.
- Comprobar que no existen menú ni contador de cabecera, y que el estado de resultados accesible sigue funcionando.
- Revisar escritorio y móvil: acceso más directo, nueve columnas conservadas, tabla desplazable sin desbordamiento de página, controles operables y logo legible.
- Comprobar contrastes de texto normal de al menos 4,5:1 y estados/bordes esenciales de controles de al menos 3:1, foco visible y uso con teclado.
- Revisar visualmente radios, espaciado, superficies y coherencia de la paleta. Actualizar solo las comprobaciones de navegador afectadas por el cambio; no crear pruebas que dupliquen estilos.

## Secuencia y entrega
Después de revisar este plan, elaborar `specs/002-diseno-visual/tasks.md`. Implementar solo al avanzar a esa etapa. Mantener los cambios en la rama de diseño; no integrar en `main` sin autorización. La web online permanece con su diseño actual durante especificación y planificación; decidir su actualización al preparar la entrega de la implementación.
