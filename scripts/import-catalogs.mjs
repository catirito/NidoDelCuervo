import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { randomUUID, createHash } from 'node:crypto';
import { catalogKey, catalogName } from '../catalog-values.js';
const [sourceFile, output] = process.argv.slice(2);
if (!sourceFile || !output) throw new Error('Indica el JSON de personajes actuales y una salida SQL nueva.');
const input = JSON.parse(await fs.readFile(sourceFile, 'utf8'));
const characters = Array.isArray(input) ? input[0].results : input.characters;
const require = createRequire(import.meta.url);
const xlsx = require('../vendor/xlsx.full.min.js');
const original = await fs.readFile(new URL('../Registro de personajes.xlsx', import.meta.url));
const workbook = xlsx.read(original, { type: 'buffer' });
const classRows = xlsx.utils.sheet_to_json(workbook.Sheets.Classes, { header: 1, defval: null });
const speciesRows = xlsx.utils.sheet_to_json(workbook.Sheets.Species, { header: 1, defval: null });
if (classRows[0].join('|') !== 'Clase|Subclase|Fuente / Libro' || speciesRows[0].join('|') !== 'Raza / Variación|Tamaño|Fuente / Libro') throw new Error('Encabezados de catálogo inesperados.');
const agios = characters.find(character => character.sourceRow === 49);
if (!agios || agios.PERSONAJE !== 'Ágios' || !['Barbarian', 'Paladin'].includes(agios.CLASS) || agios.SUBCLASS !== 'Oath of Devotion') throw new Error('Ágios no conserva el estado esperado; revisa antes de corregir.');
const classes = new Map();
const subclasses = new Map();
const species = new Map();
function addName(map, value) {
  const name = catalogName(value);
  const key = catalogKey(name);
  if (!map.has(key)) map.set(key, { id: randomUUID(), name, nameKey: key });
  return map.get(key);
}
function addPair(className, subclassName) {
  const parent = addName(classes, className);
  if (!subclassName) return;
  const name = catalogName(subclassName);
  const nameKey = catalogKey(name);
  const key = `${parent.nameKey}|${nameKey}`;
  if (!subclasses.has(key)) subclasses.set(key, { id: randomUUID(), classId: parent.id, name, nameKey });
}
for (const row of classRows.slice(1).filter(row => row[0] || row[1])) {
  if (!row[0]) throw new Error('Subclase de catálogo sin clase.');
  addPair(row[0], row[1]);
}
for (const row of speciesRows.slice(1).filter(row => row[0])) addName(species, row[0]);
for (const character of characters) {
  if (character.CLASS) addPair(character.id === agios.id ? 'Paladin' : character.CLASS, character.SUBCLASS);
  else if (character.SUBCLASS) throw new Error('Personaje con subclase sin clase.');
  if (character.SPECIE) addName(species, character.SPECIE);
}
addPair('Ranger', 'Phantom');
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const statements = [`INSERT INTO catalog_imports (id) SELECT CASE WHEN (SELECT count(*) FROM classes) + (SELECT count(*) FROM subclasses) + (SELECT count(*) FROM species) = 0 AND EXISTS (SELECT 1 FROM characters WHERE id = ${quote(agios.id)} AND version = ${agios.version} AND PERSONAJE = 'Ágios' AND CLASS = ${quote(agios.CLASS)} AND SUBCLASS = 'Oath of Devotion') THEN 1 ELSE 0 END`];
for (const [table, map, columns, properties] of [
  ['classes', classes, ['id', 'name', 'name_key'], ['id', 'name', 'nameKey']],
  ['subclasses', subclasses, ['id', 'class_id', 'name', 'name_key'], ['id', 'classId', 'name', 'nameKey']],
  ['species', species, ['id', 'name', 'name_key'], ['id', 'name', 'nameKey']]
]) {
  statements.push(`INSERT INTO ${table} (${columns.join(', ')}) SELECT ${properties.map(property => `json_extract(value, '$.${property}')`).join(', ')} FROM json_each(${quote(JSON.stringify([...map.values()]))})`);
}
if (agios.CLASS === 'Barbarian') statements.push(`UPDATE characters SET CLASS = 'Paladin', version = version + 1 WHERE id = ${quote(agios.id)} AND version = ${agios.version}`);
await fs.writeFile(output, statements.join(';\n') + ';\n', { flag: 'wx' });
console.log(JSON.stringify({ classes: classes.size, subclasses: subclasses.size, species: species.size, agiosCorrected: agios.CLASS === 'Barbarian', sourceHash: createHash('sha256').update(original).digest('hex') }));
