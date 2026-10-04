import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { randomUUID, createHash } from 'node:crypto';
import { readCharacters, fields } from '../records.js';
import { rankForLevel } from '../rank.js';
const require = createRequire(import.meta.url);
const xlsx = require('../vendor/xlsx.full.min.js');
const original = await fs.readFile(new URL('../Registro de personajes.xlsx', import.meta.url));
const characters = readCharacters(xlsx.read(original, { type: 'buffer' }), xlsx);
for (const character of characters) {
  for (const field of fields.filter(field => field !== 'NIVEL')) {
    if (character[field] !== null && typeof character[field] !== 'string') throw new Error(`Tipo inesperado en ${field}, fila ${character.sourceRow}.`);
  }
}
const corrected = characters.filter(character => character.RANGO !== rankForLevel(character.NIVEL)).length;
const rows = characters.map(character => ({ ...character, id: randomUUID(), RANGO: rankForLevel(character.NIVEL), version: 0, name_search: String(character.PERSONAJE ?? '').toLocaleLowerCase('es') }));
const encoded = JSON.stringify(rows).replaceAll("'", "''");
const columns = ['id', ...fields, 'sourceRow', 'version', 'name_search'];
const values = columns.map(field => field === 'id' ? "CASE WHEN EXISTS (SELECT 1 FROM characters) THEN NULL ELSE json_extract(value, '$.id') END" : `json_extract(value, '$.${field}')`);
const output = process.argv[2];
if (!output) throw new Error('Indica el fichero SQL de importación fuera de los archivos públicos.');
await fs.writeFile(output, `INSERT INTO characters (${columns.join(', ')}) SELECT ${values.join(', ')} FROM json_each('${encoded}');\n`, { flag: 'wx' });
console.log(JSON.stringify({ records: rows.length, corrected, sourceHash: createHash('sha256').update(original).digest('hex') }));
