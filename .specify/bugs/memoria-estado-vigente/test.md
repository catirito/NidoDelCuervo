# Bug test — memoria con estados contradictorios

Fecha: 6 de octubre de 2026. Veredicto: **verified**, exclusivamente para la corrección documental delimitada en assessment.md.

## Verificación realizada
- Reproducción anterior: lectura de Memories.md desde Git en 14306d7; confirmada la afirmación de Excel como única fuente junto a decisiones posteriores de D1.
- Repetición sobre el archivo actual: esa afirmación ya no aparece; D1 se identifica como fuente activa y los 203 registros como histórico, no total actual.
- Revisión de contenido contra README.md, server/query.js, character-fields.js, rank.js, configuraciones Wrangler y evidencia de la entrega 010: datos, catálogos, contratos y publicación coherentes en la síntesis.
- Comprobación automatizada puntual de las condiciones anteriores de texto, las reglas de sustitución/coherencia en AGENTS.md y la existencia de spec.md, plan.md y tasks.md para cada carpeta del mapa: pasa.
- Comprobación de alcance mediante git diff --name-only: solo AGENTS.md y Memories.md entre los archivos versionados modificados. Los tres informes son archivos nuevos del ejemplo.
- git diff --check: pasa.

## Repetición por otra persona
Desde la raíz del proyecto:

```sh
git show 14306d7:Memories.md
 git diff -- AGENTS.md Memories.md
 git diff --check
```

Comparar la afirmación antigua sobre Excel con el apartado Arquitectura y datos vigentes. Revisar los seis criterios de assessment.md y contrastar las referencias indicadas. No basta con buscar una frase: la revisión semántica debe confirmar que el resumen expresa las decisiones correctas. Una vez guardada la corrección en un commit, comparar ese commit con la base anterior en lugar de depender del diff local.

## Límites
No se ejecutaron escrituras, migraciones, despliegues ni pruebas de D1 para esta corrección. La revisión anterior de esta conversación ejecutó records.test.mjs y export-excel.test.mjs correctamente; esos resultados no se presentan como nuevas ejecuciones de esta fase. No se verificó producción de nuevo.

Persisten estados antiguos en otras especificaciones, señalados expresamente en Memories.md. El veredicto no certifica coherencia global del repositorio ni garantiza que futuras ediciones de la IA respeten siempre las reglas.

## Ejercicio de aprendizaje
Comprobar que la reproducción demuestra el síntoma original antes de valorar el resultado. Explicar por qué una prueba funcional de la web que pasa no demostraría, por sí sola, que esta contradicción documental está corregida.
