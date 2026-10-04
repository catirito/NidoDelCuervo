# Nido del Cuervo — edición de clase, subclase y especie

Estado: retomada por el usuario para detallar requisitos y clarificación. Plan, tareas e implementación autorizados por el usuario; entrega local, sin commit/push/publicación autorizados. Rama local y GitHub: `codex/006-edicion-catalogos`, creada antes de escribir estos documentos. Sin integración en `main`.

## Objetivo
Editar `CLASS`, `SUBCLASS` y `SPECIE` mediante selectores y nuevas opciones persistentes, reutilizando D1, UUID y guardado por lotes de las entregas anteriores.

## Decisiones conservadas
- Selectores de clase, subclase y especie con valores del Excel y opción para introducir un valor nuevo como texto.
- Al cambiar de clase, vaciar la subclase si no pertenece a la nueva clase; permitir seleccionar otra antes de Guardar, confirmado por el usuario.
- Usar tablas de catálogo para clases y subclases dentro de D1, con relación entre ambas; el esquema concreto se detallará en el plan.
- Cargar inicialmente las clases/subclases actuales y sus relaciones desde el Excel, comprobando además las combinaciones presentes en personajes para conservar sus datos. No inventar asociaciones.
- Subclases filtradas por clase elegida, usando las relaciones del Excel. Una subclase nueva se vincula directamente a la clase seleccionada.
- Persistir nuevas clases/subclases en sus catálogos al guardar, sin modificar el Excel histórico.
- Usar una tabla sencilla de catálogo de especies en la misma D1, confirmado por el usuario. Mostrar siempre todas sus opciones, aunque ningún personaje las use; cargar las del Excel y conservar las nuevas al guardar. SPECIE permanece como dato del personaje. Esta decisión sustituye la propuesta anterior de derivar opciones solo de characters.
- Valores nuevos: quitar espacios exteriores y reutilizar la grafía existente cuando solo cambian mayúsculas. Comparar subclases solo dentro de la clase seleccionada; conservar diferencias de acentos y espacios interiores.
- Clase, subclase y especie admiten «Sin dato» y máximo 50 caracteres, confirmado por el usuario. Una subclase no vacía requiere clase seleccionada; vaciar clase vacía también subclase por la regla de dependencia.
- Los cambios son locales hasta «Guardar» y se envían con los personajes modificados en un lote, no por pulsación.
- Mantener UUID, concurrencia, consulta y escritura sin contraseña/cuentas, plan gratuito, accesibilidad y móvil.
- No ejecutar tests en producción.

## Fuente verificada y dependencia
Las hojas del Excel se comprobaron en modo de solo lectura: `Classes` contiene `Clase`, `Subclase`, `Fuente / Libro`; `Species` contiene `Raza / Variación`, `Tamaño`, `Fuente / Libro`. No inferir otras columnas. No exponer las hojas completas como descarga ni añadir edición de fuentes/libros o tamaños.

004 y 005 están implementadas y validadas en local. La rama de 006 parte de su último commit local. Reutilizar GET /api/characters y PATCH /api/characters/batch, con UUID estable, fields, expectedVersion y lote atómico. Estas entregas previas no importan catálogos.

## Dirección técnica implementada en el plan autorizado
Catálogos de clases y pares clase/subclase en D1; valores iniciales desde Classes, conciliados con personajes. SPECIE permanece en characters y una tabla de especies conserva sus opciones independientemente del uso; partir de Species y conciliar con los valores presentes en personajes. Persistir nuevas opciones junto al guardado, evitando crear opciones a partir de borradores descartados. Devolver catálogos en la consulta existente para evitar endpoints adicionales si el contrato lo permite. Mantener guardado coherente de opciones y personajes sin resultados parciales silenciosos.

## Detalles resueltos en el plan autorizado
- Concretar esquema de catálogos y referencias antes de implementar.
- Concretar normalización y claves de catálogo en el plan conforme a la regla confirmada.
- Cómo conciliar relaciones ausentes o valores del registro que no aparecen en los catálogos.
- Diseño de «Añadir opción», borradores y cancelación.
- Contrato definitivo de API y atomicidad para catálogos y personajes.

## Criterios de aceptación preliminares
1. Elegir valores iniciales del Excel sin inventar ni modificar el histórico.
2. Mostrar subclases de la clase seleccionada y asociar las nuevas a esa clase.
3. Añadir clase o subclase nueva y reutilizarla desde catálogos tras guardar y recargar; mantener disponibles todas las especies, incluidas las no usadas, y reutilizar las nuevas tras guardar.
4. No persistir opciones antes de guardar el borrador.
5. Conservar el resto de campos y funciones anteriores; validar fuera de producción.

## Fuera de alcance
Cuentas, altas/bajas de personajes, propietario, edición de fuentes/libros/tamaños, rango manual y sincronización bidireccional con Excel.

## Próxima etapa
Implementar conforme a plan.md y tasks.md autorizados; validar y mostrar en local.

## Conciliación de relaciones existentes
- Lucien: Ranger–Phantom es válido según aclaración expresa del usuario. Añadir esa relación al catálogo sin eliminar Rogue–Phantom ni cambiar a Lucien. El mismo nombre de subclase puede existir bajo clases distintas; su identidad/relación no se deduplica globalmente por nombre.
- Ágios, fila 49 del Excel: corrección confirmada por el usuario a Paladin–Oath of Devotion. Aplicar solo en D1 durante la implementación de 006, conservando UUID y el resto de campos; identificar el registro de origen y comprobar su estado antes de corregir, sin pisar ediciones posteriores. Excel permanece intacto.

## Entrega local
Plan y tareas autorizados, implementación completada y validada. Esquema y contrato en plan.md; evidencia en tasks.md. Resultado local disponible para revisión. Sin commit, push ni publicación de 006.
