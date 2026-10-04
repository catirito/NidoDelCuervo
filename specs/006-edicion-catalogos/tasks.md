# Tareas — edición de catálogos

Estado: plan, tareas e implementación autorizados y completados; validación local pasa. Sin commit, push ni publicación autorizados para 006.

## 1. Esquema y carga inicial
- [x] Crear migración local de classes, subclasses y species, con UUID y claves normalizadas únicas; subclase con FK a clase.
- [x] Leer catálogos reales del Excel, excluir filas vacías y conciliar personajes actuales.
- [x] Añadir Ranger–Phantom y corregir Ágios con comprobación de identidad/estado, conservando resto de datos y Excel.
- [x] Rechazar segunda carga y separar importación de preparación de archivos.

## 2. API y transacción
- [x] Devolver catálogos completos en GET, sin endpoints nuevos.
- [x] Ampliar campos y catalogAdditions; validar pertenencia, vacíos, longitud 50 y opciones vinculadas a cambios finales.
- [x] Normalizar/reutilizar grafía por claves, con subclase única dentro de clase.
- [x] Guardar opciones/personajes en una transacción con condición conjunta de versiones, sin opciones parciales ni escrituras por conflicto.

## 3. Interfaz dependiente
- [x] Integrar selectores de clase/subclase/especie con opción vacía y texto nuevo, conservando diseño aprobado.
- [x] Filtrar subclases por clase y limpiar incompatible al cambiar clase; sin clase, deshabilitar subclase.
- [x] Conservar cursor/foco, cambios de otros campos, filtros y borradores de filas ocultas.
- [x] Derivar opciones nuevas solo del lote final; aplicar catálogos del servidor y recuperar conflictos/respuestas perdidas.

## 4. Verificación y entrega
- [x] Probar importación, relaciones reales, corrección de Ágios y Excel intacto en D1 local.
- [x] Probar validaciones, nuevas opciones, persistencia sin uso, conflictos/concurrencia y rollback de transacción.
- [x] Verificar navegador local, lotes mixtos, dependencia, teclado, recarga, recuperación, filtros, tema y móvil.
- [x] Ejecutar regresiones proporcionales, documentar evidencia y mostrar resultado local al usuario.

## Evidencia
D1 local contiene 15 clases, 150 relaciones de subclase y 179 especies. Comparación con el estado anterior confirma 203 UUID intactos y todos los campos conservados salvo CLASS de Ágios, corregida a Paladin según autorización; versiones avanzan por corrección/pruebas. Excel conserva hash original. Repetir carga se rechaza.

API local: relación de Phantom en Ranger/Rogue, nuevos valores, vacíos, normalización Unicode, catálogos sin uso, lote mixto, conflictos sin opciones parciales, creación concurrente sin duplicados/grafía divergente y rollback de la transacción mediante fallo forzado. Chrome local: dependencia, limpieza y deshabilitado, opciones nuevas/revertidas, un PATCH, recarga, respuesta perdida, conflicto incluyendo cambio remoto de clase, filtros, temas y móvil. Regresión de API 004/005 y navegador 005 pasa.

Capturas en local-edicion.png y local-movil.png. Sin pruebas en producción, commit, push ni publicación de 006. No se ha probado lector de pantalla real ni todos los navegadores.
